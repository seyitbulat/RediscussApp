using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rediscuss.IdentityService.Data;
using Rediscuss.IdentityService.DTOs;
using Rediscuss.IdentityService.Entities;
using System.Security.Claims;

namespace Rediscuss.IdentityService.Controllers
{
    [Route("api/[controller]")]
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
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };

            return Ok(userDto);
        }


        [HttpPost("{userId}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRoleToUser(int userId, [FromBody] string roleName)
        {
            var claimUserId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return BadRequest("Kullanıcı Bulunamadı");
            }

            var role = _context.Roles.FirstOrDefault(r => r.Name == roleName);

            if (role == null)
            {
                return BadRequest("Rol Bulunamadı");
            }

            var userRole = new UserRole { UserId = userId, RoleId = role.RoleId, CreatedBy = claimUserId, IsDeleted = false };

            _context.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok("Rol kullanıcıya başarıyla atandı.");
        }
    }
}
