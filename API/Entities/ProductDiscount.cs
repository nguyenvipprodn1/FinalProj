namespace API.Entities;

public class ProductDiscount
{
    public ProductDiscount()
    {
        DateCreated = DateTime.UtcNow;
    }
    
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; }
    public int DiscountValue { get; set; }
    public int DiscountUnit { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime ValidUntil { get; set; }
    public string CouponCode { get; set; }
    public int  MinimumOrderValue { get; set; }
    public int  MaximumDiscountAmount { get; set; }
    public bool IsActive => DateCreated <= DateTime.Now && DateTime.Now <= ValidUntil && DiscountUnit >= 1;
}