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
        public async Task<IActionResult> CreateComment([FromBody]CreateCommentDto createDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(!int.TryParse(userIdString, out var userId)) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 201)); }

            var isCommentExits = await _context.Posts.Find(c => c.Id == createDto.PostId && c.IsDeleted == false).AnyAsync();

            if (!isCommentExits) { return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Comment ID", 204)); }

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

            return CreateActionResult(ApiResponse<CommentDto>.Success(commentDto, 201));

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


            var tasks = allComments.ToDictionary(
                c => c.Id,
                async c =>
                {
                    var voteKey = $"comment:votes:{c.Id}";

                    var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
                    var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");

                    await Task.WhenAll(upvotesTask, downvotesTask);

                    return new CommentDto
                    {
                        Id = c.Id,
                        PostId = c.PostId,
                        Content = c.Content,
                        CreatedBy = c.CreatedBy,
                        CreatedAt = c.CreatedAt,
                        ParentCommentId = c.ParentCommentId,
                        CreatedByUsername = c.FormUsers.FirstOrDefault()?.Username ?? "",
                        UpVotes = (int) await upvotesTask,
                        DownVotes = (int) await downvotesTask
                    };
                }
                );


            var commentDtos = await Task.WhenAll(tasks.Values);
            var commentMap = tasks.Keys
                .Zip(commentDtos, (key, dto) => new { key, dto })
                .ToDictionary(x => x.key, x => x.dto);
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

            return CreateActionResult(ApiResponse<IEnumerable<CommentDto>>.Success(nestedComments, 200));
        }


    }
}
