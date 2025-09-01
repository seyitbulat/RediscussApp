using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        public string PostId { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Content { get; set; }


        public string? ParentCommentId { get; set; }
    }
}
