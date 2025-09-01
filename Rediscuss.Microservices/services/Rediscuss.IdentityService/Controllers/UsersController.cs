using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rediscuss.IdentityService.Data;
using Rediscuss.IdentityService.DTOs;
using Rediscuss.IdentityService.Entities;
using Rediscuss.Shared.Contracts;
using System.Security.Claims;

namespace Rediscuss.IdentityService.Controllers
{
    [Route("IdentityApi/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IdentityContext _context;

        public UsersController(IdentityContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        [Authorize(Roles = "Admin,User")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<UserDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetCurrentUser()
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
				var error = new ApiError { Status = "404", Title = "Not Found", Detail = "Token'a sahip kullanıcı veritabanında bulunamadı." };
				var errorResponse = StandardApiResponse<object>.Fail(new List<ApiError> { error });
				return NotFound(errorResponse);
			}

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };

			var resource = new JsonApiResource<UserDto>
			{
				Type = "users",
				Id = user.UserId.ToString(),
				Attributes = userDto
			};

			var response = StandardApiResponse<JsonApiResource<UserDto>>.Success(resource);
			return Ok(response);
		}


        [HttpPost("{userId}/roles")]
        [Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> AssignRoleToUser(int userId, [FromBody] AssignRoleDto assignRoleDto)
        {
			var user = await _context.Users.FindAsync(userId);
			if (user == null)
			{
				var userError = new ApiError { Status = "404", Title = "Not Found", Detail = $"Kullanıcı ID '{userId}' bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { userError }));
			}

			var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == assignRoleDto.RoleName);
			if (role == null)
			{
				var roleError = new ApiError { Status = "400", Title = "Bad Request", Detail = $"Rol '{assignRoleDto.RoleName}' bulunamadı." };
				return BadRequest(StandardApiResponse<object>.Fail(new List<ApiError> { roleError }));
			}

			var userRole = new UserRole { UserId = userId, RoleId = role.RoleId };
			_context.UserRoles.Add(userRole);
			await _context.SaveChangesAsync();

			var meta = new Dictionary<string, object> { { "message", $"'{role.Name}' rolü, '{user.Username}' kullanıcısına başarıyla atandı." } };
			var successResponse = StandardApiResponse<object>.Success(null, meta: meta);

			return Ok(successResponse);
		}
    }
}
