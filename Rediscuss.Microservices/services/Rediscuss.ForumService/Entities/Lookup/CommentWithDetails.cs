namespace Rediscuss.ForumService.Entities.Lookup
{
    public class CommentWithDetails : Comment
    {
        public List<FormUser> FormUsers{ get; set; }
        public List<Subredis> Subredises { get; set; }
    }
}
