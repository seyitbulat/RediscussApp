using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Rediscuss.ForumService.Entities
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
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
        public string PostId { get; set; }
    }
}
