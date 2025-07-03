using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
namespace Rediscuss.ForumService.Entities
{
    public class Post
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }


        //Iliskiler
        [BsonRepresentation(BsonType.ObjectId)]
        public string SubredisId { get; set; }
        public int CreatedBy { get; set; }
    }
}
