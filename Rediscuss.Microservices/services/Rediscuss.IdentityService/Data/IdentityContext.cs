using Microsoft.EntityFrameworkCore;
using Rediscuss.IdentityService.Entities;

namespace Rediscuss.IdentityService.Data
{
	public class IdentityContext : DbContext
	{
		public IdentityContext(DbContextOptions<IdentityContext> options) : base(options)
		{
		}

		public DbSet<User> Users { get; set; }
	}
}
