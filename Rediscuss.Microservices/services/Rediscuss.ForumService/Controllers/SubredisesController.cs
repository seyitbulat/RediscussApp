using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.Shared.Contracts;
using StackExchange.Redis;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("ForumApi/[controller]")]
    [ApiController]
    public class SubredisesController : CustomBaseController
    {
        private readonly ForumContext _context;
        private readonly IDatabase _redisDb;

        public SubredisesController(ForumContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redisDb = redis.GetDatabase();
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CreateSubredis(CreateSubredisDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId))
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204));
            }

            var subredis = new Subredis
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedBy = userId
            };

            await _context.Subredises.InsertOneAsync(subredis);

            var subscription = new Subscription
            {
                UserId = userId,
                SubredisId = subredis.Id 
            };

            await _context.Subscriptions.InsertOneAsync(subscription);

            var subredisDto = new SubredisDto
            {
                Name = subredis.Name,
                Description = subredis.Description,
                CreatedAt = subredis.CreatedAt,
                CreatedBy = subredis.CreatedBy,
                Id = subredis.Id
            };

            return CreateActionResult(ApiResponse<SubredisDto>.Success(subredisDto, 201));
        }


        [HttpPost("{subredisId}/follow")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> FollowSubredis(string subredisId)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out int userId)) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204)); }

            var subredis = _context.Subredises.Find(s => s.Id == subredisId  && s.IsDeleted == false);

            if(subredis == null) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Subredis ID", 204)); }


            var existingSubscription = _context.Subscriptions.Find(s => s.SubredisId == subredisId && s.UserId == userId && s.IsDeleted == false).FirstOrDefault();

            if(existingSubscription != null) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Bu subredis zaten takip ediliyor", 204)); }

            await _context.Subscriptions.InsertOneAsync(new Subscription { SubredisId = subredisId, IsDeleted = false, UserId = userId});

            return CreateActionResult(ApiResponse<NoDataDto>.Fail("Subredis Takip Edildi", 200));
        }

    }
}
