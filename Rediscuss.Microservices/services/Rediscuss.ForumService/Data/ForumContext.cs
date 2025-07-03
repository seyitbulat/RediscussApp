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
    }
}
