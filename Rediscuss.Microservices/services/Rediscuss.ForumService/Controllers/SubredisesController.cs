using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using StackExchange.Redis;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubredisesController : ControllerBase
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
                return Unauthorized();
            }

            var subredis = new Subredis
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedBy = userId
            };

            await _context.Subredises.InsertOneAsync(subredis);

            return CreatedAtAction(nameof(CreateSubredis), new { id = subredis.Id }, subredis);
        }


        [HttpGet("GetPostsForSubredis")]
        public async Task<IActionResult> GetPostsForSubredis(string subredisId)
        {
            var posts = await _context.Posts.Find(p => p.SubredisId == subredisId && p.IsDeleted == false).ToListAsync();
            var postDtos = posts.Select(async p =>
            {
                var voteKey = $"post:votes:{p.Id}";
                var upvotes = (int) await _redisDb.HashGetAsync(voteKey, "upvotes");
                var downvotes = (int) await _redisDb.HashGetAsync(voteKey, "downvotes");

                return new PostDto
                {
                    Id = p.Id,
                    Content = p.Content,
                    Title = p.Title,
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    SubredisId = p.SubredisId,
                    UpVotes = upvotes,
                    DownVotes = downvotes
                };

            }).ToList();


            return Ok(postDtos);
        }
    }
}
