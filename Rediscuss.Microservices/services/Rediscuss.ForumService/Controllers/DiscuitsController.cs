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
	public class DiscuitsController : CustomBaseController
	{
		private readonly ForumContext _context;
		private readonly IDatabase _redisDb;

		public DiscuitsController(ForumContext context, IConnectionMultiplexer redis)
		{
			_context = context;
			_redisDb = redis.GetDatabase();
		}

		[HttpPost]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<DiscuitDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> CreateDiscuit([FromBody] CreateDiscuitDto dto)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var isDiscuitExits = await _context.Discuits.Find(s => s.Name == dto.Name).AnyAsync();

			if (isDiscuitExits)
			{
				var error = new ApiError { Status = "400", Title = "Çakışma", Detail = $"Bu {dto.Name} isimmli discuit zaten mevcut." };
				return BadRequest(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var discuit = new Discuit
			{
				Name = dto.Name,
				Description = dto.Description,
				CreatedBy = userId
			};
			await _context.Discuits.InsertOneAsync(discuit);

			var subscription = new Subscription
			{
				UserId = userId,
				DiscuitId = discuit.Id
			};
			await _context.Subscriptions.InsertOneAsync(subscription);

			var discuitDto = new DiscuitDto
			{
				Id = discuit.Id,
				Name = discuit.Name,
				Description = discuit.Description,
				CreatedAt = discuit.CreatedAt,
				CreatedBy = discuit.CreatedBy
			};

			var resource = new JsonApiResource<DiscuitDto>
			{
				Type = "discuits",
				Id = discuit.Id,
				Attributes = discuitDto
			};

			var meta = new Dictionary<string, object> { { "message", "Discuit başarıyla oluşturuldu ve abone olundu." } };
			var response = StandardApiResponse<JsonApiResource<DiscuitDto>>.Success(resource, meta: meta);

			return StatusCode(StatusCodes.Status201Created, response);
		}

		[HttpPost("{discuitId}/follow")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status409Conflict)]
		public async Task<IActionResult> FollowDiscuit(string discuitId)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var discuitExists = await _context.Discuits.Find(s => s.Id == discuitId && s.IsDeleted == false).AnyAsync();
			if (discuitExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Takip edilmek istenen Discuit bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var existingSubscription = await _context.Subscriptions.Find(s => s.DiscuitId == discuitId && s.UserId == userId && s.IsDeleted == false).AnyAsync();
			if (existingSubscription)
			{
				var error = new ApiError { Status = "409", Title = "Çakışma", Detail = "Bu Discuit zaten takip ediliyor." };
				return Conflict(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			await _context.Subscriptions.InsertOneAsync(new Subscription { DiscuitId = discuitId, UserId = userId });

			var meta = new Dictionary<string, object> { { "message", "Discuit başarıyla takip edildi." } };
			return Ok(StandardApiResponse<object>.Success(null, meta: meta));
		}

		[HttpGet("{discuitId}/isFollowDiscuit")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> IsFollowDiscuit(string discuitId)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var discuitExists = await _context.Discuits.Find(s => s.Id == discuitId && s.IsDeleted == false).AnyAsync();
			if (discuitExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Discuit bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var existingSubscription = await _context.Subscriptions.Find(s => s.DiscuitId == discuitId && s.UserId == userId && s.IsDeleted == false).FirstOrDefaultAsync();
			var resource = new JsonApiResource<bool> { Type = "Subscriptions", Attributes = false };
			if (existingSubscription != null)
			{
				resource = new JsonApiResource<bool>
				{
					Id = existingSubscription.DiscuitId.ToString(),
					Attributes = true
				};
			}

			return Ok(StandardApiResponse<JsonApiResource<bool>>.Success(resource));
		}

		[HttpGet("GetByName/{discuitName}")]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<DiscuitDto>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetByName(string discuitName)
		{
			var discuitExists = await _context.Discuits.Find(s => s.Name == discuitName && s.IsDeleted == false).AnyAsync();
			if (discuitExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = $"'{discuitName}' Discuiti Bulunamadı" };
				return NotFound(StandardApiResponse<Object>.Fail(new List<ApiError> { error }));
			}

			var discuit = await _context.Discuits.Find(s => s.IsDeleted == false && s.Name == discuitName).FirstOrDefaultAsync();

			var user = _context.FormUsers.Find(u => u.Id == discuit.CreatedBy).FirstOrDefault();
			var discuitDto = new DiscuitDto
			{
				Name = discuit.Name,
				Id = discuit.Id,
				CreatedAt = discuit.CreatedAt,
				CreatedBy = discuit.CreatedBy,
				Description = discuit.Description,
				CreatedByUsername = user != null ? user.Username : "Bilinmiyor"
			};

			var resource = new JsonApiResource<DiscuitDto> { Id = discuit.Id.ToString(), Type = "discuits", Attributes = discuitDto };

			var response = StandardApiResponse<JsonApiResource<DiscuitDto>>.Success(resource);

			return Ok(response);
		}

		[HttpGet("GetRecommendations")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetRecommendations()
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var subscribedDiscuitIds = await _context.Subscriptions
	   .Find(s => s.UserId == userId && s.IsDeleted == false)
	   .Project(s => s.DiscuitId)
	   .ToListAsync();

			var recommendations = await _context.Discuits.Aggregate()
	   .Match(s => s.IsDeleted == false && !subscribedDiscuitIds.Contains(s.Id))
	   .Sample(5)
	   .ToListAsync();

			if (!recommendations.Any())
			{
				return Ok(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>.Success(new List<JsonApiResource<DiscuitDto>>()));
			}

			var resources = recommendations.Select(s => new JsonApiResource<DiscuitDto>
			{
				Type = "discuits",
				Id = s.Id.ToString(),
				Attributes = new DiscuitDto
				{
					Id = s.Id,
					Name = s.Name,
					Description = s.Description,
					CreatedBy = s.CreatedBy
				}
			}).ToList();

			return Ok(StandardApiResponse<List<JsonApiResource<DiscuitDto>>>.Success(resources));
		}

	}
}