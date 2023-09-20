namespace API.DTOs.Chats;

public class UserConnection
{
    public int Id { get; set; }
    public HashSet<string> Sockets { get; set; }
}