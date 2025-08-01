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
    public class VotesController : CustomBaseController
    {
        private readonly ForumContext _context;
        private readonly IDatabase _redisDb;

        public VotesController(IConnectionMultiplexer redis, ForumContext context)
        {
            _redisDb = redis.GetDatabase();
            _context = context;
        }

		[HttpPost("post")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<VoteResultDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status500InternalServerError)]
		public async Task<IActionResult> CastPostVote([FromBody] VotePostDto dto)
		{
			var postExists = await _context.Posts.Find(p => p.Id == dto.PostId && p.IsDeleted == false).AnyAsync();
			if (postExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Oylanmak istenen post bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var result = await ProcessVote("post", dto.PostId, dto.Direction);
			if (result.Success == false)
			{
				var error = new ApiError { Status = "500", Title = "Sunucu Hatası", Detail = "Oy işlenirken bir hata oluştu." };
				return StatusCode(StatusCodes.Status500InternalServerError, StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var resource = new JsonApiResource<VoteResultDto> { Type = "voteResult", Id = dto.PostId, Attributes = result.VoteResult };
			return Ok(StandardApiResponse<JsonApiResource<VoteResultDto>>.Success(resource));
		}

		[HttpPost("comment")]
		[Authorize(Roles = "User,Admin")]
		[ProducesResponseType(typeof(StandardApiResponse<JsonApiResource<VoteResultDto>>), StatusCodes.Status200OK)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status404NotFound)]
		[ProducesResponseType(typeof(StandardApiResponse<object>), StatusCodes.Status500InternalServerError)]
		public async Task<IActionResult> CastCommentVote([FromBody] VoteCommentDto dto)
		{
			var commentExists = await _context.Comments.Find(c => c.Id == dto.CommentId && c.IsDeleted == false).AnyAsync();
			if (commentExists == false)
			{
				var error = new ApiError { Status = "404", Title = "Bulunamadı", Detail = "Oylanmak istenen yorum bulunamadı." };
				return NotFound(StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var result = await ProcessVote("comment", dto.CommentId, dto.Direction);
			if (result.Success == false)
			{
				var error = new ApiError { Status = "500", Title = "Sunucu Hatası", Detail = "Oy işlenirken bir hata oluştu." };
				return StatusCode(StatusCodes.Status500InternalServerError, StandardApiResponse<object>.Fail(new List<ApiError> { error }));
			}

			var resource = new JsonApiResource<VoteResultDto> { Type = "voteResult", Id = dto.CommentId, Attributes = result.VoteResult };
			return Ok(StandardApiResponse<JsonApiResource<VoteResultDto>>.Success(resource));
		}

		private async Task<(bool Success, VoteResultDto VoteResult)> ProcessVote(string entityType, string entityId, int voteDirection)
		{
			var userId = Convert.ToInt32(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var voteKey = $"{entityType}:votes:{entityId}";
			var userVoteKey = $"{entityType}:uservotes:{entityId}"; // Changed to be entity-specific

			var previousVote = (int)await _redisDb.HashGetAsync(userVoteKey, userId.ToString());

			// If the user casts the same vote again, it toggles it off (sets to 0)
			if (previousVote == voteDirection)
			{
				voteDirection = 0;
			}

			var transaction = _redisDb.CreateTransaction();

			if (previousVote == 1) transaction.HashIncrementAsync(voteKey, "upvotes", -1);
			else if (previousVote == -1) transaction.HashIncrementAsync(voteKey, "downvotes", -1);

			if (voteDirection == 1) transaction.HashIncrementAsync(voteKey, "upvotes", 1);
			else if (voteDirection == -1) transaction.HashIncrementAsync(voteKey, "downvotes", 1);

			if (voteDirection == 0)
			{
				transaction.HashDeleteAsync(userVoteKey, userId.ToString());
			}
			else
			{
				transaction.HashSetAsync(userVoteKey, userId.ToString(), voteDirection);
			}

			bool success = await transaction.ExecuteAsync();
			if (success == false)
			{
				return (false, null);
			}

			var upvotes = (int)await _redisDb.HashGetAsync(voteKey, "upvotes");
			var downvotes = (int)await _redisDb.HashGetAsync(voteKey, "downvotes");

			return (true, new VoteResultDto { UpVotes = upvotes, DownVotes = downvotes });
		}
	}
}
