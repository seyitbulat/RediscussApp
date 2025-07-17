using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Rediscuss.ForumService.Entities
{
    public class Permission
    {
        [BsonId]
        public string Id { get; set; }

        public string ActionName { get; set; }
        public string Description { get; set; }
    }
}
