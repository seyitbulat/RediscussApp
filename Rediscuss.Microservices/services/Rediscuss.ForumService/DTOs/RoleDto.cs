using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.DTOs
{
    public class RoleDto
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


        public ICollection<PermissionDto> Permissions { get; set; }
    }
}
