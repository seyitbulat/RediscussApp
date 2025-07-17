using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.DTOs
{
    public class DeletePostDto
    {
        [Required]
        public string PostId { get; set; }

    }
}
