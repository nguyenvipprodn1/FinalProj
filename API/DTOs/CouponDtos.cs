namespace API.DTOs;

public class CouponDtos
{
    public int ProductId { get; set; }
    public int DiscountValue { get; set; }
    public int DiscountUnit { get; set; }
    public DateTime ValidUntil { get; set; }
    public string CouponCode { get; set; }
    public int  MinimumOrderValue { get; set; }
    public int  MaximumDiscountAmount { get; set; }
}