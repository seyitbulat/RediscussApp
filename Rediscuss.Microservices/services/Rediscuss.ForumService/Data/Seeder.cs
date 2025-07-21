using MongoDB.Bson;
using MongoDB.Driver;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.Data
{
    public class Seeder
    {
        private readonly ForumContext _context;

        public Seeder(ForumContext context)
        {
            _context = context;
        }

        public async Task DbInitialize()
        {
            await SeedPermissionsAsync();
            await SeedRolesAsync();
        }

        private async Task SeedPermissionsAsync()
        {
            if (await _context.Permissions.Find(_ => true).AnyAsync())
            {
                return;
            }

            var permissions = new List<Permission>
            {
                // Subredis Permissions
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:create", Description = "Yeni bir subredis oluşturma" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:follow", Description = "Bir subredis'i takip etme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:unfollow", Description = "Bir subredis'i takipten çıkma" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:edit:own", Description = "Kendi subredis'ini düzenleme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:delete:own", Description = "Kendi subredis'ini silme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "subredis:delete:any", Description = "Herhangi bir subredis'i silme (Admin)" },

                // Post Permissions
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "post:create", Description = "Yeni bir gönderi oluşturma" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "post:vote", Description = "Gönderilere oy verme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "post:edit:own", Description = "Kendi gönderisini düzenleme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "post:delete:own", Description = "Kendi gönderisini silme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "post:delete:any", Description = "Herhangi bir gönderiyi silme (Admin/Mod)" },

                // Comment Permissions
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "comment:create", Description = "Yorum yapma" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "comment:edit:own", Description = "Kendi yorumunu düzenleme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "comment:delete:own", Description = "Kendi yorumunu silme" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "comment:delete:any", Description = "Herhangi bir yorumu silme (Admin/Mod)" },

                // Role & Permission Management
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "user:assign-role", Description = "Kullanıcılara rol atama (Admin)" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "role:create", Description = "Yeni rol oluşturma (Admin)" },
                new Permission { Id = ObjectId.GenerateNewId().ToString(), ActionName = "role:edit", Description = "Rollerin izinlerini düzenleme (Admin)" }
            };

            await _context.Permissions.InsertManyAsync(permissions);
        }

        private async Task SeedRolesAsync()
        {
            if (await _context.Roles.Find(_ => true).AnyAsync())
            {
                return;
            }

            var allPermissions = await _context.Permissions.Find(_ => true).ToListAsync();

            var userPermissionNames = new List<string>
            {
                "subredis:create", "subredis:follow", "subredis:unfollow",
                "subredis:edit:own", "subredis:delete:own",
                "post:create", "post:vote",
                "post:edit:own", "post:delete:own",
                "comment:create", "comment:edit:own", "comment:delete:own"
            };

            var userPermissions = allPermissions.Where(p => userPermissionNames.Contains(p.ActionName)).ToList();

            var roles = new List<Role>
            {
                new Role
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    RoleName = "Admin",
                    Description = "Sistem Yöneticisi",
                    Scope = "System",
                    Permissions = allPermissions 
                },
                new Role
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    RoleName = "User",
                    Description = "Standart Kullanıcı",
                    Scope = "General",
                    Permissions = userPermissions 
                }
            };

            await _context.Roles.InsertManyAsync(roles);
        }
    }
}
