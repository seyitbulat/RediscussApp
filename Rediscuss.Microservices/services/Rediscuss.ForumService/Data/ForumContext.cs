using MongoDB.Driver;
using Rediscuss.ForumService.Entities;

namespace Rediscuss.ForumService.Data
{
    public class ForumContext
    {
        private readonly IMongoDatabase _database;

        public ForumContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetSection("MongoDbSettings:ConnectionString").Value;
            var databaseName = configuration.GetSection("MongoDbSettings:DatabaseName").Value;

            var client = new MongoClient(connectionString);

            _database = client.GetDatabase(databaseName);
        }



        public IMongoCollection<Subredis> Subredises => _database.GetCollection<Subredis>("Subredises");
        public IMongoCollection<Post> Posts => _database.GetCollection<Post>("Posts");
        public IMongoCollection<Subscription> Subscriptions => _database.GetCollection<Subscription>("Subscriptions");


        public IMongoCollection<UserRole> UserRoles => _database.GetCollection<UserRole>("UserRoles");

        public IMongoCollection<Permission> Permissions => _database.GetCollection<Permission>("Permissions");
        public IMongoCollection<Role> Roles => _database.GetCollection<Role>("Roles");

        public IMongoCollection<FormUser> FormUsers => _database.GetCollection<FormUser>("FormUsers");
    }
}
