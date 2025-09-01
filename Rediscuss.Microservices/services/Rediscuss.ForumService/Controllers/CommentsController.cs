using MassTransit.Initializers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.ForumService.Entities.Lookup;
using Rediscuss.Shared.Contracts;
using StackExchange.Redis;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("ForumApi/[controller]")]
    [ApiController]
    public class CommentsController : CustomBaseController
    {
        private readonly ForumContext _context;
        private readonly IDatabase _redisDb;

        public CommentsController(ForumContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redisDb = redis.GetDatabase();
        }

		[HttpPost]
		[Authorize]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<CommentDto>>), StatusCodes.Status201Created)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto createDto)
		{
			var postExists = await _context.Posts.Find(p => p.Id == createDto.PostId && p.IsDeleted == false).AnyAsync();
			if (postExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Yorum yapılmak istenen post bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var comment = new Comment
			{
				Content = createDto.Content,
				PostId = createDto.PostId,
				ParentCommentId = createDto.ParentCommentId,
				CreatedBy = userId
			};
			await _context.Comments.InsertOneAsync(comment);

			var user = await _context.FormUsers.Find(u => u.Id == userId).FirstOrDefaultAsync();
			var commentDto = new CommentDto(comment, 0, 0, user?.Username);

			var resource = new JsonApiResource<CommentDto>
			{
				Type = "comments",
				Id = comment.Id,
				Attributes = commentDto
			};

			var meta = new Dictionary<string, object> { { "message", "Yorum başarıyla oluşturuldu." } };
			var response = StandardApiResponse<JsonApiResource<CommentDto>>.Success(resource, meta: meta);

			return StatusCode(StatusCodes.Status201Created, response);
		}

		[HttpGet("post/{postId}")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(StandardApiResponse<List<JsonApiResource<CommentDto>>>), StatusCodes.Status200OK)]
		public async Task<IActionResult> GetCommentsForPost(string postId)
		{
			var allCommentsWithDetails = await _context.Comments.Aggregate()
				.Match(c => c.PostId == postId && c.IsDeleted == false)
				.SortBy(c => c.CreatedAt)
				.Lookup<Comment, FormUser, CommentWithDetails>(_context.FormUsers, c => c.CreatedBy, u => u.Id, r => r.FormUsers)
				.ToListAsync();

			var commentTasks = allCommentsWithDetails.Select(async c =>
			{
				var voteKey = $"comment:votes:{c.Id}";
				var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
				var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
				await Task.WhenAll(upvotesTask, downvotesTask);
				return new CommentDto(c, (int)await upvotesTask, (int)await downvotesTask, c.FormUsers.FirstOrDefault()?.Username);
			});

			var commentDtos = await Task.WhenAll(commentTasks);
			var commentMap = commentDtos.ToDictionary(dto => dto.Id);
			var nestedComments = new List<CommentDto>();

			foreach (var comment in commentDtos)
			{
				if (!string.IsNullOrEmpty(comment.ParentCommentId) && commentMap.TryGetValue(comment.ParentCommentId, out var parentComment))
				{
					parentComment.Replies.Add(comment);
				}
				else
				{
					nestedComments.Add(comment);
				}
			}

			var resources = nestedComments.Select(dto => new JsonApiResource<CommentDto>
			{
				Type = "comments",
				Id = dto.Id,
				Attributes = dto
			}).ToList();

			return Ok(StandardApiResponse<List<JsonApiResource<CommentDto>>>.Success(resources));
		}


	}
}
