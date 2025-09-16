using MassTransit.Initializers;
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
	public class PostsController : CustomBaseController
	{
		private readonly ForumContext _context;
		private readonly IDatabase _redisDb;

		public PostsController(ForumContext context, IConnectionMultiplexer redis)
		{
			_context = context;
			_redisDb = redis.GetDatabase();
		}

		[HttpPost]
		[Authorize(Roles = "User")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<PostDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createDto)
		{
			var subredisExists = await _context.Subredises.Find(s => s.Id == createDto.SubredisId && s.IsDeleted == false).AnyAsync();
			if (subredisExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Post oluşturulmak istenen Subredis bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var post = new Post
			{
				Title = createDto.Title,
				Content = createDto.Content,
				SubredisId = createDto.SubredisId,
				CreatedBy = userId
			};
			await _context.Posts.InsertOneAsync(post);

			var postDto = new PostDto(post, 0, 0, User.Identity.Name, "");
			var resource = new JsonApiResource<PostDto>
			{
				Type = "posts",
				Id = post.Id,
				Attributes = postDto
			};

			var meta = new Dictionary<string, object> { { "message", "Post başarıyla oluşturuldu." } };
			var response = StandardApiResponse<JsonApiResource<PostDto>>.Success(resource, meta: meta);

			return StatusCode(StatusCodes.Status201Created, response);
		}

		[HttpDelete("{postId}")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> DeletePost(string postId)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var filter = Builders<Post>.Filter.Eq(p => p.Id, postId) & Builders<Post>.Filter.Eq(p => p.IsDeleted, false);
			var post = await _context.Posts.Find(filter).FirstOrDefaultAsync();

			if (post == null)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Silinmek istenen post bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			if (post.CreatedBy != userId && !User.IsInRole("Admin"))
			{
				var error = new ApiError { Status = "403", Title = "Yasak", Detail = "Bu postu silmek için yetkiniz yok." };
				return StatusCode(StatusCodes.Status403Forbidden, StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var update = Builders<Post>.Update
				.Set(p => p.IsDeleted, true)
				.Set(p => p.DeletedBy, userId)
				.Set(p => p.DeletedAt, DateTime.UtcNow);

			await _context.Posts.UpdateOneAsync(filter, update);

			var meta = new Dictionary<string, object> { { "message", "Post başarıyla silindi." } };
			return Ok(StandardApiResponse<object>.Success(null, meta: meta));
		}

		[HttpGet("GetBySubredis/{subredisId}")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<PostDto>>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetPostsForSubredis(string subredisId, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
		{
			var subredisExists = await _context.Subredises.Find(s => s.Id == subredisId && s.IsDeleted == false).AnyAsync();
			if (subredisExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Geçersiz Subredis ID." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var filter = Builders<Post>.Filter.Eq(s => s.SubredisId, subredisId) & Builders<Post>.Filter.Eq(s => s.IsDeleted, false);
			var baseQuery = _context.Posts.Aggregate()
				.Match(filter)
				.SortByDescending(p => p.CreatedAt)
				.Lookup<Post, FormUser, PostWithDetails>(_context.FormUsers, p => p.CreatedBy, u => u.Id, r => r.FormUsers)
				.Lookup<PostWithDetails, Subredis, PostWithDetails>(_context.Subredises, p => p.SubredisId, s => s.Id, r => r.Subredises);

			var countResult = await baseQuery.Count().FirstOrDefaultAsync();
			long totalCount = countResult?.Count ?? 0;
			int totalPages = totalCount > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;

			var items = await baseQuery
					   .Skip((page - 1) * pageSize)
					   .Limit(pageSize)
					   .ToListAsync();

			var tasks = items.Select(async p =>
			{
				var voteKey = $"post:votes:{p.Id}";
				var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
				var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
				await Task.WhenAll(upvotesTask, downvotesTask);

				var dto = new PostDto(p, (int)await upvotesTask, (int)await downvotesTask, p.FormUsers.FirstOrDefault()?.Username, p.Subredises.FirstOrDefault()?.Name);
				return new JsonApiResource<PostDto> { Type = "posts", Id = p.Id, Attributes = dto };
			});
			var data = (await Task.WhenAll(tasks)).ToList();

			var meta = new Dictionary<string, object>
			{
				{ "totalCount", totalCount },
				{ "totalPages", totalPages }
			};

			var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";
			var links = new Dictionary<string, string>
			{
				{"Self", $"{baseUrl}?page={page}&pageSize={pageSize}"},
				{"First", $"{baseUrl}?page=1&pageSize={pageSize}"},
				{"Last", totalPages > 0 ? $"{baseUrl}?page={totalPages}&pageSize={pageSize}" : null}
			};

			if (page > 1 && page <= totalPages)
			{
				links.Add("Prev", $"{baseUrl}?page={page - 1}&pageSize={pageSize}");
			}

			if (page < totalPages)
			{
				links.Add("Next", $"{baseUrl}?page={page + 1}&pageSize={pageSize}");

			}

			return Ok(StandardApiResponse<List<JsonApiResource<PostDto>>>.Success(data, meta: meta, links: links));
		}

		[HttpGet]
		[AllowAnonymous]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<PostDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetPost([FromRoute] string id)
		{
			var filter = Builders<Post>.Filter.Eq(s => s.Id, id) & Builders<Post>.Filter.Eq(s => s.IsDeleted, false);
			var baseQuery = _context.Posts.Aggregate()
				.Match(filter)
				.SortByDescending(p => p.CreatedAt)
				.Lookup<Post, FormUser, PostWithDetails>(_context.FormUsers, p => p.CreatedBy, u => u.Id, r => r.FormUsers)
				.Lookup<PostWithDetails, Subredis, PostWithDetails>(_context.Subredises, p => p.SubredisId, s => s.Id, r => r.Subredises);

			var p = await baseQuery.FirstOrDefaultAsync();

			var voteKey = $"post:votes:{p.Id}";
			var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
			var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
			await Task.WhenAll(upvotesTask, downvotesTask);

			var dto = new PostDto(p, (int)await upvotesTask, (int)await downvotesTask, p.FormUsers.FirstOrDefault()?.Username, p.Subredises.FirstOrDefault()?.Name);
			var resource = new JsonApiResource<PostDto> { Type = "posts", Id = p.Id, Attributes = dto };



			return Ok(StandardApiResponse<JsonApiResource<PostDto>>.Success(resource));
		}

		[HttpGet("feed")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<PostDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetHomePageFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
		{
			var allPostsWithDetails = await _context.Posts.Aggregate()
		.Match(p => p.IsDeleted == false)
		.Lookup<Post, FormUser, PostWithDetails>(_context.FormUsers, p => p.CreatedBy, u => u.Id, r => r.FormUsers)
		.Lookup<PostWithDetails, Subredis, PostWithDetails>(_context.Subredises, p => p.SubredisId, s => s.Id, r => r.Subredises)
		.Project(r => )
		.ToListAsync();

			var tasks = allPostsWithDetails.Select(async p =>
			{
				var voteKey = $"post:votes:{p.Id}";
				var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
				var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
				await Task.WhenAll(upvotesTask, downvotesTask);

				int upvotes = (int)await upvotesTask;
				int downvotes = (int)await downvotesTask;

				var dto = new PostDto(p, upvotes, downvotes, p.FormUsers.FirstOrDefault()?.Username, p.Subredises.FirstOrDefault()?.Name);
				dto.HotScore = CalculateHotScore(upvotes, downvotes, p.CreatedAt.GetValueOrDefault());
				return dto;
			});

			var allPostDtos = await Task.WhenAll(tasks);

			var sortedPosts = allPostDtos.OrderByDescending(p => p.HotScore).ToList();

			var pagedPosts = sortedPosts
				.Skip((page - 1) * pageSize)
				.Take(pageSize)
				.Select(dto => new JsonApiResource<PostDto> { Type = "posts", Id = dto.Id, Attributes = dto })
				.ToList();

			long totalCount = sortedPosts.Count;
			int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

			var meta = new Dictionary<string, object>
	{
		{ "totalCount", totalCount },
		{ "totalPages", totalPages }
	};

			var links = new Dictionary<string, string>();
			if (page < totalPages)
			{
				links.Add("next", $"/ForumApi/Posts/hot-feed?page={page + 1}&pageSize={pageSize}");
			}
			if (page > 1)
			{
				links.Add("prev", $"/ForumApi/Posts/hot-feed?page={page - 1}&pageSize={pageSize}");
			}

			return Ok(StandardApiResponse<List<JsonApiResource<PostDto>>>.Success(pagedPosts, meta: meta, links: links));
		}

		[NonAction]
		private async Task<List<JsonApiResource<PostDto>>> GetPostsWithDetails(FilterDefinition<Post> filter, int page, int pageSize)
		{
			var posts = await _context.Posts.Aggregate()
				.Match(filter & Builders<Post>.Filter.Eq(p => p.IsDeleted, false))
				.SortByDescending(p => p.CreatedAt)
				.Skip((page - 1) * pageSize)
				.Limit(pageSize)
				.Lookup<Post, FormUser, PostWithDetails>(_context.FormUsers, p => p.CreatedBy, u => u.Id, r => r.FormUsers)
				.Lookup<PostWithDetails, Subredis, PostWithDetails>(_context.Subredises, p => p.SubredisId, s => s.Id, r => r.Subredises)
				.ToListAsync();

			var tasks = posts.Select(async p =>
			{
				var voteKey = $"post:votes:{p.Id}";
				var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
				var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
				await Task.WhenAll(upvotesTask, downvotesTask);

				var dto = new PostDto(p, (int)await upvotesTask, (int)await downvotesTask, p.FormUsers.FirstOrDefault()?.Username, p.Subredises.FirstOrDefault()?.Name);
				return new JsonApiResource<PostDto> { Type = "posts", Id = p.Id, Attributes = dto };
			});

			return (await Task.WhenAll(tasks)).ToList();
		}


		[NonAction]
		public double CalculateHotScore(int upvotes, int downvotes, DateTime createdAt)
		{
			var score = upvotes - downvotes;
			var order = Math.Log10(Math.Max(Math.Abs(score), 1));
			var sign = Math.Sign(score);
			var seconds = createdAt.Subtract(new DateTime(1970, 1, 1)).TotalSeconds - 1134028003;
			return Math.Round(sign * order + seconds / 45000, 7);
		}
	}
}
