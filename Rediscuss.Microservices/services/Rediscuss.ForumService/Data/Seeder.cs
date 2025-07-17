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
            var permissions = _context.Permissions.Find(_ => true);
            
            if(!permissions.Any())
            {
                await _context.Permissions.InsertOneAsync(new Permission
                {
                    Id = "root",
                    ActionName = "root:root:root",
                    Description = "Intialize Data"
                });
            }
            

            var roles = _context.Roles.Find(_ => true);

            if (roles.Any() == false)
            {
                await _context.Roles.InsertOneAsync(new Role
                {
                    RoleName = "root",
                    Description = "root",
                    Scope = "root"
                });
            }
        }
    }
}
