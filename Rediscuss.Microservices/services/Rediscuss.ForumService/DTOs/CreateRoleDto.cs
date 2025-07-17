using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.DTOs
{
    public class CreateRoleDto
    {
        public string RoleName { get; set; }

        public string Description { get; set; }

        public string Scope { get; set; }


        public ICollection<string> PermissionIds { get; set; }
    }
}
