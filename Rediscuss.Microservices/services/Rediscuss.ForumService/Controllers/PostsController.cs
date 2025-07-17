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
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _context.Posts.InsertOneAsync(post);

            return Ok(post); 
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> DeletePost(DeletePostDto deleteDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized();
            }

            var postExists = _context.Posts.Find(p => p.Id == deleteDto.PostId).Any();

            if (!postExists)
            {
                return BadRequest("Geçersiz Post ID.");
            }

            var update = Builders<Post>.Update
                .Set(p => p.IsDeleted, true)
                .Set(p => p.DeletedBy, userId)
                .Set(p => p.DeletedAt, DateTime.UtcNow);

            var result = await _context.Posts.UpdateOneAsync(p => p.Id == deleteDto.PostId, update);

            if (result.ModifiedCount == 0)
            {
                return StatusCode(500, "Silme işlemi başarısız.");
            }

            return Ok("Post başarıyla silindi (soft delete).");
        }
    }
}
