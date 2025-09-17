﻿namespace Rediscuss.ForumService.Entities.Lookup
{
    public class CommentWithDetails : Comment
    {
        public List<FormUser> FormUsers{ get; set; }
        public List<Discuit> Discuits { get; set; }
    }
}
