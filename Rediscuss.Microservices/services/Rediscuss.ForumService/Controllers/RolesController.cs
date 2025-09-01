using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.Shared.Contracts;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("ForumApi/[controller]")]
    [ApiController]
    public class RolesController : CustomBaseController
    {
        private readonly ForumContext _context;

        public RolesController(ForumContext context)
        {
            _context = context;
        }

		[HttpPost]
		[Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<RoleDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status409Conflict)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto createDto)
		{
			var roleExists = await _context.Roles.Find(r => r.RoleName == createDto.RoleName).AnyAsync();
			if (roleExists)
			{
				var error = new ApiError { Status = "409", Title = "Çakışma", Detail = $"'{createDto.RoleName}' adında bir rol zaten mevcut." };
				return Conflict(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var permissions = await _context.Permissions.Find(p => createDto.PermissionIds.Contains(p.Id)).ToListAsync();
			if (permissions.Count != createDto.PermissionIds.Count)
			{
				var error = new ApiError { Status = "400", Title = "Geçersiz İstek", Detail = "Gönderilen yetki ID'lerinden bazıları geçersiz." };
				return BadRequest(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var role = new Role
			{
				RoleName = createDto.RoleName,
				Description = createDto.Description,
				Scope = createDto.Scope,
				Permissions = permissions,
				CreatedBy = userId
			};

			await _context.Roles.InsertOneAsync(role);

			var roleDto = new RoleDto
			{
				Id = role.Id,
				RoleName = role.RoleName,
				Scope = role.Scope,
				Description = role.Description,
				Permissions = role.Permissions.Select(p => new PermissionDto { Id = p.Id, ActionName = p.ActionName, Description = p.Description }).ToList(),
				CreatedBy = role.CreatedBy
			};

			var resource = new JsonApiResource<RoleDto>
			{
				Type = "roles",
				Id = role.Id,
				Attributes = roleDto
			};

			var meta = new Dictionary<string, object> { { "message", "Rol başarıyla oluşturuldu." } };
			var response = StandardApiResponse<JsonApiResource<RoleDto>>.Success(resource, meta: meta);

			return StatusCode(StatusCodes.Status201Created, response);
		}


	}
}
