using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Rediscuss.ForumService.Entities
{
    public class Discuit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }


        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }

        public bool? IsDeleted { get; set; } = false;

    }
}