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
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<SubredisDto>>), StatusCodes.Status201Created)]
		public async Task<IActionResult> CreateSubredis([FromBody] CreateSubredisDto dto)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

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
				Id = subredis.Id,
				Name = subredis.Name,
				Description = subredis.Description,
				CreatedAt = subredis.CreatedAt,
				CreatedBy = subredis.CreatedBy
			};

			var resource = new JsonApiResource<SubredisDto>
			{
				Type = "subredises",
				Id = subredis.Id,
				Attributes = subredisDto
			};

			var meta = new Dictionary<string, object> { { "message", "Subredis başarıyla oluşturuldu ve abone olundu." } };
			var response = StandardApiResponse<JsonApiResource<SubredisDto>>.Success(resource, meta: meta);

			// Henüz bir GetById metodu olmadığı için CreatedAtAction yerine 201 Created dönüyoruz.
			return StatusCode(StatusCodes.Status201Created, response);
		}

		[HttpPost("{subredisId}/follow")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status409Conflict)]
		public async Task<IActionResult> FollowSubredis(string subredisId)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var subredisExists = await _context.Subredises.Find(s => s.Id == subredisId && s.IsDeleted == false).AnyAsync();
			if (subredisExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Takip edilmek istenen Subredis bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var existingSubscription = await _context.Subscriptions.Find(s => s.SubredisId == subredisId && s.UserId == userId && s.IsDeleted == false).AnyAsync();
			if (existingSubscription)
			{
				var error = new ApiError { Status = "409", Title = "Çakışma", Detail = "Bu Subredis zaten takip ediliyor." };
				return Conflict(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			await _context.Subscriptions.InsertOneAsync(new Subscription { SubredisId = subredisId, UserId = userId });

			var meta = new Dictionary<string, object> { { "message", "Subredis başarıyla takip edildi." } };
			return Ok(StandardApiResponse<object>.Success(null, meta: meta));
		}

	}
}
