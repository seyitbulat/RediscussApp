using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Rediscuss.ForumService.Entities
{
    public class Role
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string RoleName { get; set; }

        public string Description { get; set; }

        public string Scope { get; set; }


        public ICollection<Permission> Permissions { get; set; }
    }
}
