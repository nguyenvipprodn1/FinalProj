namespace API.DTOs.Chats
{
    public class AddUserToGroupRequest
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }
    }
}