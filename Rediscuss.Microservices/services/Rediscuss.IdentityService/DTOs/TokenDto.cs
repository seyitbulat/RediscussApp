namespace Rediscuss.IdentityService.DTOs
{
	public class TokenDto
	{
        public string Token { get; set; }
		public string RefreshToken { get; set; }

		public int AccessTokenExpiresIn { get; set; }
		public int RefreshTokenExpiresIn { get; set; }
	}
}
