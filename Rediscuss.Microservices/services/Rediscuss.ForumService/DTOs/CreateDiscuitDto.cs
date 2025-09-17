using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.DTOs
{
    public class CreateDiscuitDto
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

    }
}