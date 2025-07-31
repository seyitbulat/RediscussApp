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
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CastPostVote(VotePostDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var postId = dto.PostId;
            var voteDirection = dto.Direction;

            var voteKey = $"post:votes:{postId}";

            var userVoteKey = $"post:uservotes:{userId}";

            var previousVote = (int)await _redisDb.HashGetAsync(userVoteKey, userId);

            if(previousVote == voteDirection)
            {
                voteDirection = 0;
            }

            var transaction = _redisDb.CreateTransaction();

            if (previousVote == 1) transaction.HashIncrementAsync(voteKey, "upvotes", -1);
            if (previousVote == -1) transaction.HashIncrementAsync(voteKey, "downvotes", -1);

            if (voteDirection == 1) transaction.HashIncrementAsync(voteKey, "upvotes", 1);
            if (voteDirection == -1) transaction.HashIncrementAsync(voteKey, "downvotes", 1);

            if (voteDirection == 0)
            {
                transaction.HashDeleteAsync(userVoteKey, userId);
            }
            else
            {
                transaction.HashSetAsync(userVoteKey, userId, voteDirection);
            }

            bool result = await transaction.ExecuteAsync();

            if (!result)
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Oy işlenirken bir hata oluştu.", 500));
            }

            var upvotes = (int)await _redisDb.HashGetAsync(voteKey, "upvotes");
            var downvotes = (int)await _redisDb.HashGetAsync(voteKey, "downvotes");

            var voteResultDto = new VoteResultDto
            {
                UpVotes = upvotes,
                DownVotes = downvotes
            };

            return CreateActionResult(ApiResponse<VoteResultDto>.Success(voteResultDto, 200));

        }

        [HttpPost("comment")]
        public async Task<IActionResult> CastCommentVote(VoteCommentDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var isCommentExits = await _context.Comments.Find(c => c.Id == dto.CommentId).AnyAsync();

            if (!isCommentExits) { return BadRequest("Böyle bir yorum bulunamadı"); }

            var voteDirection = dto.Direction;

            var voteKey = $"comment:votes:{dto.CommentId}";
            var userVoteKey = $"comment:uservotes:{userId}";


            var previousVote = (int)await _redisDb.HashGetAsync(userVoteKey, userId);

            if(previousVote == voteDirection)
            {
                voteDirection = 0;
            }

            var transaction = _redisDb.CreateTransaction();

            if (previousVote == 1) transaction.HashIncrementAsync(voteKey, "upvotes", -1);
            if (previousVote == -1) transaction.HashIncrementAsync(voteKey, "downvotes", -1);

            if (voteDirection == 1) transaction.HashIncrementAsync(voteKey, "upvotes", 1);
            if (voteDirection == -1) transaction.HashIncrementAsync(voteKey, "downvotes", 1);

            if (voteDirection == 0)
            {
                transaction.HashDeleteAsync(userVoteKey, userId);
            }
            else
            {
                transaction.HashSetAsync(userVoteKey, userId, voteDirection);
            }

            bool result = await transaction.ExecuteAsync();

            if (!result)
            {
                return StatusCode(500, "Oy işlenirken bir hata oluştu.");
            }

            var upvotes = (int)await _redisDb.HashGetAsync(voteKey, "upvotes");
            var downvotes = (int)await _redisDb.HashGetAsync(voteKey, "downvotes");

            var voteResultDto = new VoteResultDto
            {
                UpVotes = upvotes,
                DownVotes = downvotes
            };

            return CreateActionResult(ApiResponse<VoteResultDto>.Success(voteResultDto, 200));

        }
    }
}
