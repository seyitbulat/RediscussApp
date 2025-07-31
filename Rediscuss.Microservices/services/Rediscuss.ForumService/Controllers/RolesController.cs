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
        public async Task<IActionResult> CreateRole(CreateRoleDto createDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var permissions = await _context.Permissions.Find(p => createDto.PermissionIds.Contains(p.Id)).ToListAsync();

            var role = new Role
            {
                RoleName = createDto.RoleName,
                Description = createDto.Description,
                Scope = createDto.Scope,
                Permissions = permissions
            };

            await _context.Roles.InsertOneAsync(role);

            return CreateActionResult(ApiResponse<NoDataDto>.Success(201));

        }


    }
}
