namespace Rediscuss.ForumService.DTOs
{
    public class PostDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string SubredisId { get; set; }
        public int CreatedBy { get; set; }


        // Vote

        public int UpVotes { get; set; }
        public int DownVotes { get; set; }
    }
}
