using Microsoft.AspNetCore.Authorization;
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
    public class PostsController : ControllerBase
    {
        private readonly ForumContext _context;

        public PostsController(ForumContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized();
            }

            var subredisExists = await _context.Subredises.Find(s => s.Id == createDto.SubredisId).AnyAsync();
            if (!subredisExists)
            {
                return BadRequest("Geçersiz Subredis ID.");
            }

            var post = new Post
            {
                Title = createDto.Title,
                Content = createDto.Content,
                SubredisId = createDto.SubredisId,
                CreatedBy = userId
            };

            await _context.Posts.InsertOneAsync(post);

            return Ok(post); 
        }
    }
}
