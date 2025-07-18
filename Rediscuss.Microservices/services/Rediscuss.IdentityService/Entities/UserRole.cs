using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rediscuss.IdentityService.Entities
{
    public class UserRole
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }


        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; }

        public bool IsDeleted { get; set; } = false;


        public User User { get; set; }
        public Role Role { get; set; }


    }
}
