using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.ForumService.Entities.Lookup;
using System.Security.Claims;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ForumContext _context;

        public CommentsController(ForumContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateComment([FromBody]CreateCommentDto createDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out var userId)) { return Unauthorized(); }

            var isCommentExits = await _context.Posts.Find(c => c.Id == createDto.PostId && c.IsDeleted == false).AnyAsync();

            if (!isCommentExits) { return BadRequest(); }

            var comment = new Comment
            {
                Content = createDto.Content,
                PostId = createDto.PostId,
                ParentCommentId = createDto.ParentCommentId,
                CreatedBy = userId
            };
            
            await _context.Comments.InsertOneAsync(comment);

            var user = await _context.FormUsers.Find(u => u.Id == userId).FirstOrDefaultAsync();

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                ParentCommentId = comment.ParentCommentId,
                Content = comment.Content,
                CreatedBy = comment.CreatedBy,
                CreatedAt = comment.CreatedAt,
                CreatedByUsername = user?.Username ?? "bilinmiyor"
            };

            return Ok(commentDto);
        }


        [HttpGet("post/{postId}")]
        public async Task<IActionResult> GetCommentsForPost(string postId)
        {
            var allComments = await _context.Comments.Aggregate()
                .Match(c => c.PostId == postId)
                .SortBy(c => c.CreatedAt)
                .Lookup<Comment, FormUser, CommentWithDetails>(
                    _context.FormUsers,
                    c => c.CreatedBy,
                    u => u.Id,
                    result => result.FormUsers
                ).ToListAsync();

            var commentMap = allComments.ToDictionary(
                c => c.Id,
                c => new CommentDto
                {
                    Id = c.Id,
                    PostId = c.PostId,
                    Content = c.Content,
                    CreatedBy = c.CreatedBy,
                    CreatedAt= c.CreatedAt,
                    ParentCommentId= c.ParentCommentId,
                    CreatedByUsername = c.FormUsers.FirstOrDefault()?.Username ?? ""
                }
                );

            var nestedComments = new List<CommentDto>();

            foreach ( var comment in commentMap.Values)
            {
                if(comment.ParentCommentId != null && commentMap.TryGetValue(comment.ParentCommentId, out var parentComment))
                {
                    parentComment.Replies.Add(comment);
                }
                else
                {
                    nestedComments.Add(comment);
                }
            }

            return Ok(nestedComments);
        }

    }
}
