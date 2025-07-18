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



        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }


        public bool? IsDeleted { get; set; } = false;


        public ICollection<Permission> Permissions { get; set; }
    }
}
