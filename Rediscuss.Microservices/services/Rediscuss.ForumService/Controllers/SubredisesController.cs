using Microsoft.AspNetCore.Authorization;
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
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> CreateSubredis([FromBody] CreateSubredisDto dto)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var isSubredisExits = await _context.Subredises.Find(s => s.Name == dto.Name).AnyAsync();

			if (isSubredisExits)
			{
				var error = new ApiError { Status = "400", Title = "Çakışma", Detail = $"Bu {dto.Name} isimmli subredis zaten mevcut." };
				return BadRequest(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
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

		[HttpGet("{subredisId}/isFollowSubredis")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> IsFollowSubredis(string subredisId)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var subredisExists = await _context.Subredises.Find(s => s.Id == subredisId && s.IsDeleted == false).AnyAsync();
			if (subredisExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Subredis bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var existingSubscription = await _context.Subscriptions.Find(s => s.SubredisId == subredisId && s.UserId == userId && s.IsDeleted == false).FirstOrDefaultAsync();
			var resource = new JsonApiResource<bool> { Type = "Subscriptions", Attributes = false };
			if (existingSubscription != null)
			{
				resource = new JsonApiResource<bool>
				{
					Id = existingSubscription.SubredisId.ToString(),
					Attributes = true
				};
			}

			return Ok(StandardApiResponse<JsonApiResource<bool>>.Success(resource));
		}

		[HttpGet("GetByName/{subredisName}")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<SubredisDto>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetByName(string subredisName)
		{
			var subredisExists = await _context.Subredises.Find(s => s.Name == subredisName && s.IsDeleted == false).AnyAsync();
			if (subredisExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"'{subredisName}' Subredisi Bulunamadı" };
				return NotFound(StandardApiResponse<Object>.Fail(new List<ApiError> { error }));
			}

			var subredis = await _context.Subredises.Find(s => s.IsDeleted == false && s.Name == subredisName).FirstOrDefaultAsync();

			var user = _context.FormUsers.Find(u => u.Id == subredis.CreatedBy).FirstOrDefault();
			var subredisDto = new SubredisDto
			{
				Name = subredis.Name,
				Id = subredis.Id,
				CreatedAt = subredis.CreatedAt,
				CreatedBy = subredis.CreatedBy,
				Description = subredis.Description,
				CreatedByUsername = user != null ? user.Username : "Bilinmiyor"
			};

			var resource = new JsonApiResource<SubredisDto> { Id = subredis.Id.ToString(), Type = "subredises", Attributes = subredisDto };

			var response = StandardApiResponse<JsonApiResource<SubredisDto>>.Success(resource);

			return Ok(response);
		}

		[HttpGet("GetRecommendations")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<SubredisDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetRecommendations()
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var subscribedSubredisIds = await _context.Subscriptions
	   .Find(s => s.UserId == userId && s.IsDeleted == false)
	   .Project(s => s.SubredisId)
	   .ToListAsync();

			var recommendations = await _context.Subredises.Aggregate()
	   .Match(s => s.IsDeleted == false && !subscribedSubredisIds.Contains(s.Id))
	   .Sample(5)
	   .ToListAsync();

			if (!recommendations.Any())
			{
				return Ok(StandardApiResponse<List<JsonApiResource<SubredisDto>>>.Success(new List<JsonApiResource<SubredisDto>>()));
			}

			var resources = recommendations.Select(s => new JsonApiResource<SubredisDto>
			{
				Type = "subredises",
				Id = s.Id.ToString(),
				Attributes = new SubredisDto
				{
					Id = s.Id,
					Name = s.Name,
					Description = s.Description,
					CreatedBy = s.CreatedBy
				}
			}).ToList();

			return Ok(StandardApiResponse<List<JsonApiResource<SubredisDto>>>.Success(resources));
		}

	}
}
