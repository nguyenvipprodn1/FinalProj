using System.Collections.Generic;

namespace API.DTOs.Chats.SignalRChatVM
{
    public class TypingModel
    {
        public int ChatId { get; set; }
        public UserInMessage FromUser { get; set; }
        public List<int> ToUserId { get; set;  }
        public bool Typing { get; set;  }
    }
}