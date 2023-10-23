using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace API.Entities;

public class CouponMarketingInfo
{
    public int Id { get; set; }
    public int CouponId { get; set; }
    public ProductDiscount ProductDiscount { get; set; }
    public string Description { get; set; }
    public string Subject { get; set; }
    public DateTime ScheduleOn { get; set; }
}