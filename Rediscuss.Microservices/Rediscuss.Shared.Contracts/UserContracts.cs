namespace Rediscuss.Shared.Contracts
{
    public class UserContracts
    {
        public record UserCreated(int UserId, string Username);
        public record UserDeleted(int UserId);
    }
}
