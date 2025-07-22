using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Rediscuss.ForumService.DTOs
{
    public class CommentDto
    {
        public string Id { get; set; }
        public string Content { get; set; }

        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }


        // Vote

        public int UpVotes { get; set; }
        public int DownVotes { get; set; }


        //Iliskiler
        public string PostId { get; set; }
        public string ParentCommentId { get; set; }

        public List<CommentDto> Replies { get; set; } = new();



        public string CreatedByUsername { get; set; }
    }
}
