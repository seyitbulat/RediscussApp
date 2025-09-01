using MassTransit;
using MongoDB.Driver;
using Rediscuss.ForumService.Data;
using Rediscuss.ForumService.Entities;
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


			var existingUser = _context.FormUsers.Find(u => u.Id == message.UserId);

			if (existingUser == null)
			{
				return;
			}

			await _context.FormUsers.InsertOneAsync(new Entities.FormUser { Id = message.UserId, Username = message.Username });
			var role = await _context.Roles.Find(r => r.RoleName == "User").FirstOrDefaultAsync();

			var userRole = new UserRole { UserId = message.UserId, RoleId = role.Id };

			await _context.UserRoles.InsertOneAsync(userRole);

		}
	}
}
