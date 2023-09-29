using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DTOs.Chats.SignalRChatVM
{
    public class ChatModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public object ChatUser { get; set; }
        public List<UserInChatSignalR> Users { get; set; } // Represents the users involved in the chat
        public List<object> Messages { get; set; } // Represents the chat message content
    }
    
    public class UserInChatSignalR
    {
        public int Id { get; set; }
        public string Avatar { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Gender = "male";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        [JsonIgnore]
        public string Status { get; set; }
    }

    public class AddFriendModel
    {
        public List<ChatModel> Chats { get; set; }
    }
}