using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class ChatUser
{
    public int Id { get; set; }
    [Required]
    public int UserId { get; set; }
    [Required]
    public int ChatId { get; set; }
}