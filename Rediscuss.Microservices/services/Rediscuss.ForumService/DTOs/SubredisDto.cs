namespace Rediscuss.ForumService.DTOs
{
    public class SubredisDto
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }


        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }

    }
}
