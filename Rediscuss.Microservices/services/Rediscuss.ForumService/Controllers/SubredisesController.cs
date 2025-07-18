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
    }
}
