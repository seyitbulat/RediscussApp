﻿using System.ComponentModel.DataAnnotations;

namespace Rediscuss.ForumService.DTOs
{
    public class CreatePostDto
    {
        [Required]
        public string Title { get; set; }
        public string? Content { get; set; }

        [Required]
        public string DiscuitId { get; set; }
    }
}
