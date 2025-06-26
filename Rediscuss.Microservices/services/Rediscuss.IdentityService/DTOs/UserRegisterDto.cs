using System.ComponentModel.DataAnnotations;

namespace Rediscuss.IdentityService.DTOs
{
	public class UserRegisterDto
	{
		[Required]
		[StringLength(50, MinimumLength = 3)]
		public string Username { get; set; }

		[Required]
		[EmailAddress]
		public string Email { get; set; }

		[Required]
		[StringLength(100, MinimumLength = 6)]
		public string Password { get; set; }
	}


	public class UserLoginDto
	{
		[Required]
		public string Username { get; set; }

		[Required]
		public string Password { get; set; }
	}
}
