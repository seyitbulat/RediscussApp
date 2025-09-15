using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rediscuss.IdentityService.Entities
{
	public class RefreshToken
	{
		[Key]
		public int Id { get; set; }

		public required int UserId { get; set; } 

		[ForeignKey("UserId")]
		public User User { get; set; } 

		public required string Token { get; set; }
		public DateTime Expires { get; set; }
		public DateTime Created { get; set; } = DateTime.Now;
		public DateTime? Revoked { get; set; } 

		public bool IsExpired => DateTime.Now >= Expires;
		public bool IsRevoked => Revoked != null;
		public bool IsActive => !IsRevoked && !IsExpired;
	}
}

