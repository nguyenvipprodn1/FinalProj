namespace API.DTOs.Chats.SignalRChatVM
{
    public class AddUserToGroupModel
    {
        public ChatModel Chat { get; set; }
        public UserInChatSignalR NewChatter { get; set; }
    }
}