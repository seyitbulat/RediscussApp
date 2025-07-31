using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Rediscuss.IdentityService.Data;
using Rediscuss.IdentityService.DTOs;
using Rediscuss.IdentityService.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

        public AuthController(IdentityContext context, IConfiguration configuration, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _configuration = configuration;
            _publishEndpoint = publishEndpoint;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email);
            if (userExists)
            {
                return BadRequest("Kullanıcı adı veya e-posta zaten mevcut.");
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

            await _publishEndpoint.Publish(new UserCreated(user.UserId, user.Username));

            return Ok(new { Message = "Kullanıcı başarıyla oluşturuldu." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _context.Users.Select(x => new User
            {
                UserId = x.UserId,
                Username = x.Username,
                Email = x.Email,
                PasswordHash = x.PasswordHash,
                UserRoles = x.UserRoles.Select(y => new UserRole { Role = new Role { Name = y.Role.Name} }).ToList()
            }).FirstOrDefaultAsync(u => u.Username == loginDto.Username);
            if (user == null)
            {
                return Unauthorized("Geçersiz kullanıcı adı veya şifre."); // Güvenlik için hangi bilginin yanlış olduğunu söyleme
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Unauthorized("Geçersiz kullanıcı adı veya şifre.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var rawKey = Convert.FromBase64String(_configuration["Jwt:Key"]);
            var signingKey = new SymmetricSecurityKey(rawKey);


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
                Expires = DateTime.UtcNow.AddHours(3),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
            };

            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(securityToken);
        }
    }
}
