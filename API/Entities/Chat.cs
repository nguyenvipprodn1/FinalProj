using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Chat
{
    public int Id { get; set; }
    [Required]
    public string Type { get; set; }
}