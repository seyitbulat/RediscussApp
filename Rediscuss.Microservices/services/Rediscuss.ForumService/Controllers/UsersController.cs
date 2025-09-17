﻿using Microsoft.AspNetCore.Authorization;
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
	public class UsersController : ControllerBase
	{
		private readonly ForumContext _context;

		public UsersController(ForumContext context)
		{
			_context = context;
		}

		[HttpPost("{userId}/roles")]
		[Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status409Conflict)]
		public async Task<IActionResult> AssignRoleToUser(int userId, [FromBody] AssignRoleDto assignRoleDto)
		{
			var userExists = await _context.FormUsers.Find(u => u.Id == userId).AnyAsync();
			if (!userExists)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"{userId} ID'li kullanıcı bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var role = await _context.Roles.Find(r => r.RoleName == assignRoleDto.RoleName).FirstOrDefaultAsync();
			if (role == null)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"'{assignRoleDto.RoleName}' adında bir rol bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userAlreadyHasRole = await _context.UserRoles.Find(u => u.UserId == userId && u.RoleId == role.Id && u.IsDeleted == false).AnyAsync();
			if (userAlreadyHasRole)
			{
				var error = new ApiError { Status = "409", Title = "Çakışma", Detail = "Kullanıcı zaten bu role sahip." };
				return Conflict(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var assigningUserId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var userRole = new UserRole { UserId = userId, RoleId = role.Id, CreatedBy = assigningUserId };
			await _context.UserRoles.InsertOneAsync(userRole);

			var meta = new Dictionary<string, object> { { "message", $"'{role.RoleName}' rolü, {userId} ID'li kullanıcıya başarıyla atandı." } };
			return Ok(StandardApiResponse<object>.Success(null, meta: meta));
		}

		[HttpGet("{targetUserId}/roles")]
		[Authorize(Roles = "Admin,User")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<RoleDto>>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetUserRoles(int targetUserId)
		{
			var userExists = await _context.FormUsers.Find(u => u.Id == targetUserId).AnyAsync();
			if (!userExists)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"{targetUserId} ID'li kullanıcı bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userRoles = await _context.UserRoles.Find(u => u.UserId == targetUserId && u.IsDeleted == false).ToListAsync();
			var roleIds = userRoles.Select(ur => ur.RoleId).ToList();

			if (!roleIds.Any())
			{
				return Ok(StandardApiResponse<List<JsonApiResource<RoleDto>>>.Success(new List<JsonApiResource<RoleDto>>()));
			}

			var roles = await _context.Roles.Find(r => roleIds.Contains(r.Id) && r.IsDeleted == false).ToListAsync();
			var resources = roles.Select(r => new JsonApiResource<RoleDto>
			{
				Type = "roles",
				Id = r.Id.ToString(),
				Attributes = new RoleDto
				{
					Id = r.Id,
					RoleName = r.RoleName,
					Scope = r.Scope,
					Description = r.Description,
					Permissions = r.Permissions.Select(p => new PermissionDto { Id = p.Id, ActionName = p.ActionName, Description = p.Description }).ToList(),
					CreatedBy = r.CreatedBy
				}
			}).ToList();

			return Ok(StandardApiResponse<List<JsonApiResource<RoleDto>>>.Success(resources));
		}

		[HttpDelete("{targetUserId}/roles/{roleName}")]
		[Authorize(Roles = "Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> DeleteUserRole(int targetUserId, string roleName)
		{
			var userExists = await _context.FormUsers.Find(u => u.Id == targetUserId).AnyAsync();
			if (!userExists)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"{targetUserId} ID'li kullanıcı bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var role = await _context.Roles.Find(r => r.RoleName == roleName).FirstOrDefaultAsync();
			if (role == null)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"'{roleName}' adında bir rol bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userRoleFilter = Builders<UserRole>.Filter.And(
				Builders<UserRole>.Filter.Eq(u => u.UserId, targetUserId),
				Builders<UserRole>.Filter.Eq(u => u.RoleId, role.Id),
				Builders<UserRole>.Filter.Eq(u => u.IsDeleted, false)
			);

			var userRole = await _context.UserRoles.Find(userRoleFilter).FirstOrDefaultAsync();
			if (userRole == null)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Kullanıcı bu role sahip değil." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var assigningUserId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var update = Builders<UserRole>.Update
				.Set(u => u.IsDeleted, true)
				.Set(u => u.DeletedAt, DateTime.UtcNow)
				.Set(u => u.DeletedBy, assigningUserId);

			await _context.UserRoles.UpdateOneAsync(userRoleFilter, update);

			var meta = new Dictionary<string, object> { { "message", $"'{role.RoleName}' rolü, {targetUserId} ID'li kullanıcıdan başarıyla kaldırıldı." } };
			return Ok(StandardApiResponse<object>.Success(null, meta: meta));
		}

		[HttpGet("me/subscriptions")]
		[Authorize(Roles = "Admin,User")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetMySubscriptions()
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var subscriptions = await _context.Subscriptions.Find(s => s.IsDeleted == false && s.UserId == userId).ToListAsync();

			if (!subscriptions.Any())
			{
				return Ok(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>.Success(new List<JsonApiResource<DiscuitDto>>()));
			}

			var discuitIds = subscriptions.Select(s => s.DiscuitId);
			var discuits = await _context.Discuits.Find(s => discuitIds.Contains(s.Id) && s.IsDeleted == false).ToListAsync();
			var resources = discuits.Select(s => new JsonApiResource<DiscuitDto>
			{
				Type = "discuits",
				Id = s.Id.ToString(),
				Attributes = new DiscuitDto
				{
					Id = s.Id,
					Name = s.Name,
					Description = s.Description,
					CreatedBy = s.CreatedBy,
					CreatedAt = s.CreatedAt
				}
			}).ToList();

			return Ok(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>.Success(resources));
		}
	}
}
