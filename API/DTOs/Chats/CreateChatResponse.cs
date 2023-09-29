using API.Entities;

namespace API.DTOs.Chats
{
    public class CreateChatResponse
    {
        public List<CreateChatResponseModel> CreateChatResponseModels { get; set; }
    }

    public class CreateChatResponseModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Object ChatUser { get; set; }
        public List<UserInMessage> Users { get; set; }
        public List<ChatMessage> Messages = new List<ChatMessage>();
    }
}