using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rediscuss.ForumService.DTOs;
using StackExchange.Redis;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VotesController : ControllerBase
    {
        private readonly IDatabase _redisDb;

        public VotesController(IConnectionMultiplexer redis)
        {
            _redisDb = redis.GetDatabase();
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CastVote(VoteDto dto)
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
                return StatusCode(500, "Oy işlenirken bir hata oluştu.");
            }

            var upvotes = (int)await _redisDb.HashGetAsync(voteKey, "upvotes");
            var downvotes = (int)await _redisDb.HashGetAsync(voteKey, "downvotes");

            return Ok(new { upvotes, downvotes });
        }
    }
}
