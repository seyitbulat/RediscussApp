using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.Entities
{
	public class User
	{
		[Key]
		public int UserId { get; set; }

		[Required]
		[StringLength(50)]
		public string Username { get; set; }

		[Required]
		public string Email { get; set; }

		[Required]
		public string PasswordHash { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	}
}
