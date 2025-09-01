using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.DTOs
{
    public class PostWithDetails : Post
    {
        public List<Subredis> Subredises { get; set; }
        public List<FormUser> FormUsers { get; set; }
    }
}
