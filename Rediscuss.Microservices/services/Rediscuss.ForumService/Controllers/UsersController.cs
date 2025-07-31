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
    public class UsersController : CustomBaseController
    {
        private readonly ForumContext _context;

        public UsersController(ForumContext context)
        {
            _context = context;
        }


        [HttpPost("{userId}/roles)")]
        public async Task<IActionResult> AssignRoleToUser(int userId, string roleName)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out userId)) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204)); }



            var role = _context.Roles.Find(s => s.RoleName == roleName).FirstOrDefault();
            
            if(role == null) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Role ID", 204)); }

            var isExituserRole = _context.UserRoles.Find(u => u.UserId == userId && u.RoleId == role.Id && u.IsDeleted == false).Any();

            if(isExituserRole) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bu Role Sahip", 204)); ; }

            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = role.Id,
                IsDeleted = false,
                CreatedBy = userId
            };

            await _context.UserRoles.InsertOneAsync(userRole);

            return CreateActionResult(ApiResponse<NoDataDto>.Success(201));

        }


        [HttpGet("{targetUserId}/roles")]
        public async Task<IActionResult> GetUserRoles(int targetUserId)
        {
            int userId;
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdString, out userId)) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204)); }

            var userRoles = await _context.UserRoles.Find(u => u.UserId == targetUserId && u.IsDeleted == false).ToListAsync();

            var isUserExists = await _context.FormUsers.Find(u => u.Id == targetUserId).AnyAsync();

            if (!isUserExists) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz User ID", 204)); }

            var roleIds = userRoles.Select(u => u.RoleId).ToList();

            if (roleIds.Count == 0) { return Ok(new List<RoleDto> ()); }

            var filter = Builders<Role>.Filter.In(r => r.Id, roleIds) & Builders<Role>.Filter.Eq(s => s.IsDeleted, false);

            var roles = await _context.Roles.Find(filter).ToListAsync();

            var roleDtos = roles.Select(r => new RoleDto { 
                Id = r.Id,
                RoleName = r.RoleName,
                Scope = r.Scope,
                Description = r.Description,
                Permissions = r.Permissions.Select(p => new PermissionDto { Id = p.Id, ActionName = p.ActionName, Description = p.Description}).ToList(),
                CreatedBy = userId
            });


            return CreateActionResult(ApiResponse<IEnumerable<RoleDto>>.Success(200));
        }


        [HttpDelete("{targetUserId}/roles/{roleName}")]
        public async Task<IActionResult> DeleteUserRole(int targetUserId, string roleName)
        {
            int userId;
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdString, out userId)) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204)); }

            var role = _context.Roles.Find(r => r.RoleName == roleName).FirstOrDefault();

            if(role == null) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçeresiz Role ID", 204)); }

            var isUserExists = await _context.FormUsers.Find(u => u.Id == targetUserId).AnyAsync();

            if (!isUserExists) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz User ID", 204)); }

            var userRoleFilter = Builders<UserRole>.Filter.And(
                    Builders<UserRole>.Filter.Eq(u => u.UserId, targetUserId),
                    Builders<UserRole>.Filter.Eq(u => u.RoleId, role.Id),
                    Builders<UserRole>.Filter.Eq(u => u.IsDeleted, false)
                );

            var userRole = _context.UserRoles.Find(userRoleFilter).FirstOrDefault();

            if(userRole == null) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bu Role Sahip Değil", 204)); }    

            var update = Builders<UserRole>.Update
                .Set(u => u.IsDeleted, true)
                .Set(u => u.DeletedAt, DateTime.UtcNow)
                .Set(u => u.DeletedBy, userId);


            await _context.UserRoles.UpdateOneAsync(userRoleFilter, update);
            return CreateActionResult(ApiResponse<IEnumerable<RoleDto>>.Success(200));

        }


        [HttpGet("me/subscriptions")]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out var userId)) { return Unauthorized(); }

            var subscriptions = await _context.Subscriptions.Find(s => s.IsDeleted == false && s.UserId == userId).ToListAsync();

            if (!subscriptions.Any())
            {
                return Ok(new List<SubredisDto> ());
            }

            var subscribedSubredisIds = subscriptions.Select(s => s.SubredisId).ToList();


            var filter = Builders<Subredis>.Filter.In(s => s.Id, subscribedSubredisIds) & Builders<Subredis>.Filter.Eq(s => s.IsDeleted, false);

            var subredises = await _context.Subredises.Find(filter).ToListAsync();

            var subredisDtos = subredises.Select(s => new SubredisDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                CreatedBy = s.CreatedBy,
                CreatedAt = s.CreatedAt
            }).ToList();

            return CreateActionResult(ApiResponse<IEnumerable<SubredisDto>>.Success(subredisDtos,200));
        }
    }
}
