using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.DTOs
{
    public class VoteDto
    {
        [Required]
        public string PostId { get; set; }

        [Range(-1, 1)]
        public int Direction { get; set; }
    }
}
