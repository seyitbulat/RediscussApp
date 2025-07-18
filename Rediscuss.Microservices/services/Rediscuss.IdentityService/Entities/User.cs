using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.Entities
{
	public class User
	{
		public int UserId { get; set; }

		[Required]
		[StringLength(50)]
		public string Username { get; set; }

		[Required]
		[StringLength(50)]
		[EmailAddress]
		public string Email { get; set; }

		[Required]
        [StringLength(512)]
        public string PasswordHash { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


		public List<UserRole> UserRoles { get; set; }

	}
}
