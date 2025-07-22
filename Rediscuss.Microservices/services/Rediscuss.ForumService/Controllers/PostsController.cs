using MassTransit.Initializers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;
using Rediscuss.Shared.Contracts;
using StackExchange.Redis;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : CustomBaseController
    {
        private readonly ForumContext _context;
        private readonly IDatabase _redisDb;

        public PostsController(ForumContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redisDb = redis.GetDatabase();
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId))
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı",201));
            }

            var subredisExists = await _context.Subredises.Find(s => s.Id == createDto.SubredisId).AnyAsync();
            if (!subredisExists)
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Subredis ID", 204));
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

            return CreateActionResult(ApiResponse<Post>.Success(post, 201));
        }


        [HttpPost("Delete")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> DeletePost(DeletePostDto deleteDto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId))
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 204));
            }

            var postExists = _context.Posts.Find(p => p.Id == deleteDto.PostId).Any();

            if (!postExists)
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Post ID", 204));

            }

            var update = Builders<Post>.Update
                .Set(p => p.IsDeleted, true)
                .Set(p => p.DeletedBy, userId)
                .Set(p => p.DeletedAt, DateTime.UtcNow);

            var result = await _context.Posts.UpdateOneAsync(p => p.Id == deleteDto.PostId, update);

            if (result.ModifiedCount == 0)
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Silme işlemi başarısız.", 500));

            }

            return CreateActionResult(ApiResponse<NoDataDto>.Success(200));

        }


        [HttpGet("GetBySubredis/{subredisId}")]
        public async Task<IActionResult> GetPostsForSubredis(string subredisId, [FromQuery] int page = 1, int pageSize = 25)
        {
            var subredisIsExists = await _context.Subredises.Find(s => s.Id == subredisId && s.IsDeleted == false).AnyAsync();


            if (!subredisIsExists)
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Geçersiz Subredis ID", 204));
            }


            var posts = await _context.Posts.Aggregate()
                .Match(p => p.IsDeleted == false && p.SubredisId == subredisId)
                .SortByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .Lookup<Post, FormUser, PostWithDetails>(
                    _context.FormUsers,
                    post => post.CreatedBy,
                    user => user.Id,
                    result => result.FormUsers
                )
                .Lookup<PostWithDetails, Subredis, PostWithDetails>(
                    _context.Subredises,
                    post => post.SubredisId,
                    subredis => subredis.Id,
                    result => result.Subredises
                )
                .ToListAsync();


            var tasks = posts.Select(async p =>
            {
                var voteKey = $"post:votes:{p.Id}";

                var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
                var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");

                await Task.WhenAll(upvotesTask, downvotesTask);


                return new PostDto
                {
                    Id = p.Id,
                    Content = p.Content,
                    Title = p.Title,
                    SubredisId = p.SubredisId,
                    UpVotes = (int)await upvotesTask,
                    DownVotes = (int)await downvotesTask,
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedBy = p.UpdatedBy,
                    CreatedByUserName = p.FormUsers.FirstOrDefault()?.Username ?? "",
                    SubredisName = p.Subredises.FirstOrDefault()?.Name ?? ""
                };
            }).ToList();

            var postDtos = await Task.WhenAll(tasks);

            return CreateActionResult(ApiResponse<IEnumerable<PostDto>>.Success(postDtos,200));
        }


        [HttpGet("feed")]
        [Authorize]
        public async Task<IActionResult> GetHomePageFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId))
            {
                return CreateActionResult(ApiResponse<NoDataDto>.Fail("Kullanıcı Bulunamadı", 201));
            }


            var subcribedSubredisIds = await _context.Subscriptions.Find(s => s.UserId == userId && s.IsDeleted == false).Project(s => s.SubredisId).ToListAsync();

            if (!subcribedSubredisIds.Any()) { return Ok(new List<Post>()); }

            var filter = Builders<Post>.Filter.Eq(p => p.IsDeleted, false) & Builders<Post>.Filter.In(p => p.SubredisId, subcribedSubredisIds);

            var posts = await _context.Posts.Aggregate()
                .Match(p => p.IsDeleted == false && subcribedSubredisIds.Contains(p.SubredisId))
                .SortByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .Lookup<Post, FormUser, PostWithDetails>(
                    _context.FormUsers,
                    post => post.CreatedBy,
                    user => user.Id,
                    result => result.FormUsers
                )
                .Lookup<PostWithDetails, Subredis, PostWithDetails>(
                    _context.Subredises,
                    post => post.SubredisId,
                    subredis => subredis.Id,
                    result => result.Subredises
                )
                .ToListAsync();

            var tasks = posts.Select(async p =>
            {
                var voteKey = $"post:votes:{p.Id}";

                var upvotesTask = _redisDb.HashGetAsync(voteKey, "upvotes");
                var downvotesTask = _redisDb.HashGetAsync(voteKey, "downvotes");
                await Task.WhenAll(upvotesTask, downvotesTask);

                return new PostDto
                {
                    Id = p.Id,
                    Content = p.Content,
                    Title = p.Title,
                    SubredisId = p.SubredisId,
                    UpVotes = (int)await upvotesTask,
                    DownVotes = (int)await downvotesTask,
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    UpdatedAt = p.UpdatedAt,
                    UpdatedBy = p.UpdatedBy,
                    CreatedByUserName = p.FormUsers.FirstOrDefault()?.Username ?? "",
                    SubredisName = p.Subredises.FirstOrDefault()?.Name ?? ""
                };


            });

            var postDtos = await Task.WhenAll(tasks);

            return CreateActionResult(ApiResponse<IEnumerable<PostDto>>.Success(postDtos, 200));

        }
    }
}
