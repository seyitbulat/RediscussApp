using MassTransit;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using static Rediscuss.Shared.Contracts.UserContracts;

namespace Rediscuss.ForumService.Consumers
{
    public class UserCreatedConsumer : IConsumer<UserCreated>
    {
        private readonly ForumContext _context;

        public UserCreatedConsumer(ForumContext context)
        {
            _context = context;
        }

        public async Task Consume(ConsumeContext<UserCreated> context)
        {
            var message = context.Message;

            var existingUser = _context.FormUsers.Find(u => u.Id == message.UserId).Any();

            if (!existingUser)
            {
                await _context.FormUsers.InsertOneAsync(new Entities.FormUser { Id = message.UserId, Username = message.Username });
            }
        }
    }
}
