using System.Collections.Generic;

namespace API.DTOs.Chats.SignalRChatVM
{
    public class DeleteChatModel
    {
        public int ChatId { get; set; }
        public List<int> NotifyUsers { get; set; }
    }
}