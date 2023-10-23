namespace API.Entities;

public class AutomationMail
{
    public int Id { get; set; }
    public int CouponInfoId { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public string Gmail { get; set; }
    public DateTime ScheduleOn { get; set; }
    public string Status { get; set; }
}