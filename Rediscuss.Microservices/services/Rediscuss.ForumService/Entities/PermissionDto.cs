using MongoDB.Bson.Serialization.Attributes;

namespace Rediscuss.ForumService.Entities
{
    public class PermissionDto
    {
        public string Id { get; set; }

        public string ActionName { get; set; }
        public string Description { get; set; }
    }
}
