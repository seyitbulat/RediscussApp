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
		public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
			modelBuilder.Entity<User>(entity =>
			{
				entity.HasKey(e => e.UserId).HasName("UserId");


			});

			modelBuilder.Entity<Role>(entity =>
			{
				entity.HasKey(e => e.RoleId).HasName("RoleId");


			});

			modelBuilder.Entity<UserRole>(entity =>
			{
				entity.HasKey(e => new {UserId = e.UserId, RoleId = e.RoleId});

				entity.HasOne(e => e.Role).WithMany().HasForeignKey(e => e.RoleId).HasPrincipalKey(e => e.RoleId);
				entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).HasPrincipalKey(e => e.UserId);

				entity.HasOne(e => e.User).WithMany(e => e.UserRoles).HasForeignKey(e => e.UserId);
			});

            base.OnModelCreating(modelBuilder);
        }
    }
}
