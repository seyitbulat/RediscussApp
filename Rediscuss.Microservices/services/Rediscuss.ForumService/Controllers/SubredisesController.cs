using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.DTOs;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubredisesController : ControllerBase
    {
        private readonly ForumContext _context;

        public SubredisesController(ForumContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubredis(CreateSubredisDto dto)
        {
            var subredis = new Subredis
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedBy = dto.CreatedBy
            };

            await _context.Subredises.InsertOneAsync(subredis);

            return CreatedAtAction(nameof(CreateSubredis), new {id = subredis.Id}, subredis);
        }
    }
}
