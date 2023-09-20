using Microsoft.AspNetCore.Http;

namespace API.DTOs.Chats
{
    public class UploadImageRequest
    {
        public IFormFile image { get; set; }
        public string id { get; set; }
    }
}