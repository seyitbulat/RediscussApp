using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.DTOs
{
    public class PostWithUser
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }


        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }


        public bool? IsDeleted { get; set; } = false;


        //Iliskiler
        [BsonRepresentation(BsonType.ObjectId)]
        public string SubredisId { get; set; }


        public Subredis Subredis { get; set; }
        public FormUser FormUser { get; set; }
    }
}
