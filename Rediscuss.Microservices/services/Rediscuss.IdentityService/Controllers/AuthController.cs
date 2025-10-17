using Azure;
using MassTransit;
using MassTransit.Transports;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Rediscuss.IdentityService.Data;
using Rediscuss.IdentityService.DTOs;
using Rediscuss.IdentityService.Entities;
using Rediscuss.Shared.Contracts;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static Rediscuss.Shared.Contracts.UserContracts;

namespace Rediscuss.IdentityService.Controllers
{
	[Route("IdentityApi/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly IdentityContext _context;
		private readonly IConfiguration _configuration;
		private readonly IPublishEndpoint _publishEndpoint;
		private readonly ISendEndpointProvider _sendEndpointProvider;


		public AuthController(IdentityContext context, IConfiguration configuration, IPublishEndpoint publishEndpoint, ISendEndpointProvider sendEndpointProvider)
		{
			_context = context;
			_configuration = configuration;
			_publishEndpoint = publishEndpoint;
			_sendEndpointProvider = sendEndpointProvider;
		}

		[HttpPost("register")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<UserDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status409Conflict)]
		public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
		{
			var userExists = await _context.Users.AnyAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email);
			if (userExists)
			{
				var error = new ApiError { Status = "409", Title = "Kullanıcı Mevcut", Detail = "Kullanıcı adı veya e-posta zaten mevcut." };
				var errorResponse = StandardApiResponse<object>.Fail(new List<ApiError> { error });
				return new ObjectResult(errorResponse) { StatusCode = 409 };
			}

			string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

			var user = new User
			{
				Username = registerDto.Username,
				Email = registerDto.Email,
				PasswordHash = passwordHash,
				CreatedAt = DateTime.UtcNow
			};

			var role = _context.Roles.FirstOrDefault(r => r.Name == "User");

			user.UserRoles = new List<UserRole>
				{
					new UserRole { RoleId = role.RoleId }
				};
			await _context.Users.AddAsync(user);
			await _context.SaveChangesAsync();

			var newUserDto = new UserDto
			{
				UserId = user.UserId,
				Email = user.Email,
				Username = user.Username,
				CreatedAt = user.CreatedAt
			};

			var resource = new JsonApiResource<UserDto>
			{
				Type = "users",
				Id = user.UserId.ToString(),
				Attributes = newUserDto
			};

			var meta = new Dictionary<string, object> { { "message", "Kullanıcı başarıyla oluşturuldu." } };

			var successResponse = StandardApiResponse<JsonApiResource<UserDto>>.Success(resource, meta: meta);

			var endpoint = await _sendEndpointProvider.GetSendEndpoint(new Uri("queue:user-creation-queue"));
			await endpoint.Send(new UserCreated(user.UserId, user.Username));


			return CreatedAtAction(nameof(Register), new { id = user.UserId }, successResponse);


		}

		[HttpPost("login")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<TokenDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status401Unauthorized)]
		public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
		{
			var user = await _context.Users.Select(x => new User
			{
				UserId = x.UserId,
				Username = x.Username,
				Email = x.Email,
				PasswordHash = x.PasswordHash,
				UserRoles = x.UserRoles.Select(y => new UserRole { Role = new Role { Name = y.Role.Name } }).ToList()
			}).FirstOrDefaultAsync(u => u.Username == loginDto.Username);

			if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
			{
				var error = new ApiError { Status = "401", Title = "Kullanıcı Bilgileri Hatası", Detail = "Geçersiz kullanıcı adı veya şifre." };
				var apiResponse = StandardApiResponse<object>.Fail(new List<ApiError> { error });

				return Unauthorized(apiResponse);
			}

			var (token, accessTokenExpiresIn) = GenerateJwtToken(user);
			var (refreshToken, refreshTokenExpiresIn) = GenerateRefreshToken(user);

			var tokenDto = new TokenDto { Token = token, RefreshToken = refreshToken.Token, AccessTokenExpiresIn = accessTokenExpiresIn, RefreshTokenExpiresIn = refreshTokenExpiresIn};

			var oldRefreshTokens = _context.RefreshTokens.Where(x => x.UserId == user.UserId);
			
			if (oldRefreshTokens.Any())
				_context.RefreshTokens.RemoveRange(oldRefreshTokens);

			await _context.RefreshTokens.AddAsync(refreshToken);

			await _context.SaveChangesAsync();
			var resource = new JsonApiResource<TokenDto> { Type = "authenticationToken", Id = Guid.NewGuid().ToString(), Attributes = tokenDto };

			var meta = new Dictionary<string, object> { { "message", "Başarıyla Giriş Yapıldı" } };

			var response = StandardApiResponse<JsonApiResource<TokenDto>>.Success(resource, meta: meta);


			return Ok(response);
		}

		[HttpPost("refresh-token")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<RefreshToken>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status401Unauthorized)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
		{

			

			var storedRefreshToken = _context.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshTokenDto.RefreshToken);
			if (storedRefreshToken == null)
			{
				throw new BadHttpRequestException("Invalid or expired refresh token");
			}

			var user = await _context.Users.Select(x => new User
			{
				UserId = x.UserId,
				Username = x.Username,
				Email = x.Email,
				PasswordHash = x.PasswordHash,
				UserRoles = x.UserRoles.Select(y => new UserRole { Role = new Role { Name = y.Role.Name } }).ToList()
			}).FirstOrDefaultAsync(u => u.UserId == storedRefreshToken.UserId);

			_ = user == null ? throw new BadHttpRequestException("Invalid or expired refresh token") : "";




			if (storedRefreshToken.IsExpired || storedRefreshToken.IsRevoked)
			{
				throw new BadHttpRequestException("Invalid or expired refresh token");
			}

			storedRefreshToken.Revoked = DateTime.Now;

			var (token, accessTokenExpiresIn) = GenerateJwtToken(user);
			var (refreshToken, refreshTokenExpiresIn) = GenerateRefreshToken(user);

			await _context.RefreshTokens.AddAsync(refreshToken);
			
			await _context.SaveChangesAsync();
			
			var tokenDto = new TokenDto { Token = token, RefreshToken = refreshToken.Token, AccessTokenExpiresIn = accessTokenExpiresIn, RefreshTokenExpiresIn = refreshTokenExpiresIn };

			var resource = new JsonApiResource<TokenDto> { Type = "authenticationToken", Id = Guid.NewGuid().ToString(), Attributes = tokenDto };

			var response = StandardApiResponse<JsonApiResource<TokenDto>>.Success(resource);

			return Ok(response);

		}

		private (RefreshToken, int) GenerateRefreshToken(User user)
		{
			using var rngCryptoServiceProvider = new RNGCryptoServiceProvider();

			var randomBytes = new byte[64];

			var refreshTokenExpiresIn = int.Parse(_configuration["RefreshTokenExpiresIn"]);

			rngCryptoServiceProvider.GetBytes(randomBytes);

			return (
				new RefreshToken
				{
					UserId = user.UserId,
					Token = Convert.ToBase64String(randomBytes),
					Expires = DateTime.Now.AddSeconds(refreshTokenExpiresIn),
					Created = DateTime.Now
				},
				refreshTokenExpiresIn
				);
		}

		private (string, int) GenerateJwtToken(User user, bool rememberMe = false)
		{
			var tokenHandler = new JwtSecurityTokenHandler();

			var rawKey = Convert.FromBase64String(_configuration["Jwt:Key"]);
			var signingKey = new SymmetricSecurityKey(rawKey);

			var accessTokenExpiresIn = rememberMe ? int.Parse(_configuration["AccessTokenExpiresInRememberMe"]) : int.Parse(_configuration["AccessTokenExpiresIn"]);

			var claims = new List<Claim>
			{
				new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
				new Claim(JwtRegisteredClaimNames.Name, user.Username),
				new Claim(JwtRegisteredClaimNames.Email, user.Email),
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
			};

			foreach (var role in user.UserRoles)
			{
				claims.Add(new Claim(ClaimTypes.Role, role.Role.Name));
			}

			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(claims),
				Expires = DateTime.UtcNow.AddSeconds(accessTokenExpiresIn),
				Issuer = _configuration["Jwt:Issuer"],
				Audience = _configuration["Jwt:Audience"],
				SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
			};

			var securityToken = tokenHandler.CreateToken(tokenDescriptor);
			return (tokenHandler.WriteToken(securityToken), accessTokenExpiresIn);
		}
	}
}
