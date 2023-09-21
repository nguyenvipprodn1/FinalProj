using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class ChatMessage
{
    public ChatMessage()
    {
        CreateAt = DateTime.UtcNow;
    }
    public int Id { get; set; }
    [Required]
    public string Type { get; set; }
    [Required]
    public string Message { get; set; }
    [Required]
    public int ChatId { get; set; }
    [Required]
    public int FromUserId { get; set; }
    public DateTime CreateAt { get; set; }
    public DateTime? UpdateAt { get; set; }

}