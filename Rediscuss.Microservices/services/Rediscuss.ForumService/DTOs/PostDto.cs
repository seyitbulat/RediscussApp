﻿using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.DTOs
{
    public class PostDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public string DiscuitId { get; set; }




        // Vote

        public int UpVotes { get; set; }
        public int DownVotes { get; set; }



        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }


        public string CreatedByUserName { get; set; }


        public string DiscuitName { get; set; }

		public double HotScore { get; set; }
		public PostDto(Post post, int upVotes, int downVotes, string createdByUserName, string discuitName)
		{
			Id = post.Id;
			Title = post.Title;
			Content = post.Content;
			DiscuitId = post.DiscuitId;
			CreatedAt = post.CreatedAt;
			CreatedBy = post.CreatedBy;
			UpdatedAt = post.UpdatedAt;
			UpdatedBy = post.UpdatedBy;
			UpVotes = upVotes;
			DownVotes = downVotes;
			CreatedByUserName = createdByUserName;
			DiscuitName = discuitName;
		}

	}
}
