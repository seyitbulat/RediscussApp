using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.DTOs
{
	public class RoleDto
	{
		public int RoleId { get; set; }

		public string Name { get; set; }

		public DateTime? CreatedAt { get; set; }

	}
}
