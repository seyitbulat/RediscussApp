using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.Entities
{
    public class VoteCommentDto
    {
        [Required]
        public string CommentId { get; set; }

        [Range(-1, 1)]
        public int Direction { get; set; }
    }
}
