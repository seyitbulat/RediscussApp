using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ForumContext _context;

        public UsersController(ForumContext context)
        {
            _context = context;
        }

        [HttpGet("me/subscriptions")]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out var userId)) { return Unauthorized(); }

            var subscriptions = await _context.Subscriptions.Find(s => s.IsDeleted == false && s.UserId == userId).ToListAsync();

            if (!subscriptions.Any())
            {
                return Ok(new List<SubredisDto> ());
            }

            var subscribedSubredisIds = subscriptions.Select(s => s.SubredisId).ToList();


            var filter = Builders<Subredis>.Filter.In(s => s.Id, subscribedSubredisIds) & Builders<Subredis>.Filter.Eq(s => s.IsDeleted, false);

            var subredises = await _context.Subredises.Find(filter).ToListAsync();

            var subredisDtos = subredises.Select(s => new SubredisDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                CreatedBy = s.CreatedBy,
                CreatedAt = s.CreatedAt
            }).ToList();

            return Ok(subredisDtos);
        }
    }
}
