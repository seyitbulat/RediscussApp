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
		public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
			modelBuilder.Entity<User>(entity =>
			{
				entity.HasKey(e => e.UserId);
			});

			modelBuilder.Entity<Role>(entity =>
			{
				entity.HasKey(e => e.RoleId);
			});

			modelBuilder.Entity<UserRole>(entity =>
			{
				entity.HasKey(e => e.UserId);
				entity.HasKey(e => e.RoleId);

				entity.HasOne(e => e.Role);
				entity.HasOne(e => e.User);
			});

            base.OnModelCreating(modelBuilder);
        }
    }
}
