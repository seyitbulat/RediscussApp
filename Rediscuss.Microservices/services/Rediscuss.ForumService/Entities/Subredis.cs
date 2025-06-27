using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Rediscuss.ForumService.Entities
{
    public class Subredis
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }


        public string Name { get; set; }

        public string Description { get; set; }


        public int CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
