namespace Rediscuss.ForumService.DTOs
{
    public class DiscuitDto
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }


        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }


        public string CreatedByUsername { get; set; }

    }
}