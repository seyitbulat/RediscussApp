using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.DTOs
{
    public class CreateRoleDto
    {

        [Required]
        [StringLength(50)]
        public string Name { get; set; }
    }
}
