using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.Entities
{
    public class Role
    {
        public int RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;


        public int? CreatedBy { get; set; }



    }
}
