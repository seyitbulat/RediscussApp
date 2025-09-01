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
    [Authorize(Roles = "Admin")]
    [ApiController]
    public class RolesController : ControllerBase
    {

        private readonly IdentityContext _context;

        public RolesController(IdentityContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<RoleDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> GetById(int id)
        {
			var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

			var user = await _context.Users.FindAsync(userId);

			if (user == null)
			{
				var error = new ApiError { Status = "404", Title = "Not Found", Detail = "Token'a sahip kullanıcı veritabanında bulunamadı." };
				var errorResponse = StandardApiResponse<object>.Fail(new List<ApiError> { error });
				return NotFound(errorResponse);
			}

			var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleId == id);
			if (role == null)
			{
				var roleError = new ApiError { Status = "404", Title = "Not Found", Detail = $"Rol ID '{id}' bulunamadı." };
				return BadRequest(StandardApiResponse<object>.Fail(new List<ApiError> { roleError }));
			}

            var roleDto = new RoleDto { RoleId = id, Name = role.Name, CreatedAt = role.CreatedAt};

            var resource = new JsonApiResource<RoleDto> { Id = id.ToString(), Type = "roles", Attributes = roleDto };

            var response = StandardApiResponse<JsonApiResource<RoleDto>>.Success(resource);

			return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<RoleDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> CreateRole(CreateRoleDto createDto)
        {
            var userId = Convert.ToInt32(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                var error = new ApiError { Status = "404", Title = "Not Found", Detail = "Token'a sahip kullanıcı veritabanında bulunamadı." };
                var errorResponse = StandardApiResponse<object>.Fail(new List<ApiError> { error });
                return NotFound(errorResponse);
            }

            var role = new Role
            {
                Name = createDto.Name,
                CreatedBy = userId
            };


            _context.Add(role);

            await _context.SaveChangesAsync();


            var roleDto = new RoleDto { Name = role.Name, RoleId = role.RoleId, CreatedAt = role.CreatedAt };

            var resource = new JsonApiResource<RoleDto> { Id = role.RoleId.ToString(), Type = "roles", Attributes = roleDto };


            var response = StandardApiResponse<JsonApiResource<RoleDto>>.Success(resource);

            return CreatedAtAction(nameof(CreateRole), new { id = role.RoleId }, response);
        }



        
    }
}
