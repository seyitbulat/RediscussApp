using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rediscuss.IdentityService.Data;
using Rediscuss.IdentityService.DTOs;
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
    }
}
