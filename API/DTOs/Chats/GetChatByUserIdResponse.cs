using System;
using System.Collections.Generic;

namespace API.DTOs.Chats
{
    public class GetChatByUserIdResponse
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ChatUserResponse ChatUser { get; set; }
        // list of user info we chat with
        public List<UserResponse> Users { get; set; }
        public List<MessageResponse> Messages { get; set; }
    }

    public class ChatUserResponse
    {
        public int ChatId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class UserResponse
    {
        public int Id { get; set; }
        public string Avatar { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Gender = "male";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ChatUserResponse ChatUser { get; set; }
    }

    public class MessageResponse
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public int ChatId { get; set; }
        public int FromUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        // info of user who write this message
        public UserInMessage User { get; set; }
    }
    
    public class UserInMessage
    {
        public int Id { get; set; }
        public string Avatar { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Gender = "male";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}