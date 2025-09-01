using MongoDB.Bson.Serialization.Attributes;

namespace Rediscuss.ForumService.Entities
{
    public class FormUser
    {
        [BsonId]
        public int Id { get; set; }
        public string Username { get; set; }
    }
}
