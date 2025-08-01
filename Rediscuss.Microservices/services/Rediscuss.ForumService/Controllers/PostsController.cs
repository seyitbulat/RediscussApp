using MassTransit.Initializers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.Shared.Contracts;
using StackExchange.Redis;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

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

			var postsWithDetails = await GetPostsWithDetails(Builders<Post>.Filter.Eq(p => p.SubredisId, subredisId), page, pageSize);
			return Ok(StandardApiResponse<List<JsonApiResource<PostDto>>>.Success(postsWithDetails));
		}

		[HttpGet("feed")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<PostDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetHomePageFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var subcribedSubredisIds = await _context.Subscriptions.Find(s => s.UserId == userId && s.IsDeleted == false).Project(s => s.SubredisId).ToListAsync();

			if (!subcribedSubredisIds.Any())
			{
				return Ok(StandardApiResponse<List<JsonApiResource<PostDto>>>.Success(new List<JsonApiResource<PostDto>>()));
			}

			var postsWithDetails = await GetPostsWithDetails(Builders<Post>.Filter.In(p => p.SubredisId, subcribedSubredisIds), page, pageSize);
			return Ok(StandardApiResponse<List<JsonApiResource<PostDto>>>.Success(postsWithDetails));
		}

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
	}
}
