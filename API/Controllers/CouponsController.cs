using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CouponsController: BaseApiController
{
    private readonly UserManager<User> _userManager;
    private readonly StoreContext _context;
    private readonly IMapper _mapper;
    public CouponsController(StoreContext context, IMapper mapper, UserManager<User> userManager)
    {
        _mapper = mapper;
        _context = context;
        _userManager = userManager;
    }
    
    [HttpGet]
    public IList<ProductDiscount> GetAll()
    {
        return _context.ProductDiscounts.Include(_=>_.Product).ToList();
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById([FromRoute] int id)
    {
        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.Id == id);
        return Ok(coupon);
    }

    [HttpPost]
    public IActionResult Create(CouponDtos input)
    {
        var productDiscount = new ProductDiscount();
        _mapper.Map(input, productDiscount);
        
        _context.ProductDiscounts.Add(productDiscount);
        _context.SaveChanges();
            
        return Ok(productDiscount);
    }
        
    [HttpPut("{id:int}")]
    public IActionResult Update([FromRoute] int id,CouponDtos input)
    {
        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.Id == id);

        _mapper.Map(input, coupon);

        _context.SaveChanges();
        return Ok(coupon);
    }
    
    [HttpDelete("{id:int}")]
    public IActionResult Delete([FromRoute] int id)
    {
        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.Id == id);

        if (coupon == null)
            return BadRequest();

        _context.ProductDiscounts.Remove(coupon);
        _context.SaveChanges();
        
        return Ok();
    }
    
    [HttpGet("marketing/{id:int}")]
    public IActionResult GetCouponMarketingById([FromRoute] int id)
    {
        var coupon = _context.CouponMarketingInfos.FirstOrDefault(_ => _.CouponId == id);
        return Ok(coupon);
    }
    
    [HttpGet("marketing/couponCode/{code}")]
    public IActionResult GetCouponMarketingByCode([FromRoute] string code)
    {
        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.CouponCode == code.Trim());
        return Ok(coupon);
    }
    
    [HttpGet("marketing/applyCoupon/{code}")]
    public async Task<IActionResult> ApplyCoupon(string code)
    {
        var userBasket =  await _context.Baskets
            .Include(i => i.Items)
            .ThenInclude(p => p.Product)
            .FirstOrDefaultAsync(basket => basket.BuyerId == User.Identity.Name);
       
        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.CouponCode == code.Trim());
        
        var basket = userBasket?.MapBasketToDto();
        var product = basket.Items.FirstOrDefault(_ => _.ProductId == coupon.ProductId);
        if (product != null && product.Price * product.Quantity > coupon.MinimumOrderValue && coupon.IsActive)
        {
            var discountValue = Math.Min(coupon.MaximumDiscountAmount,  Math.Floor((double)product.Price / 100) * product.Quantity * coupon.DiscountValue/100);

            userBasket.RemoveItem(coupon.ProductId, product.Quantity);
            var productdb = await _context.Products.FindAsync(coupon.ProductId);

            if (productdb == null) return BadRequest(new ProblemDetails { Title = "Product not found" });
            
            userBasket.AddItemCoupon(productdb, product.Quantity, coupon.Id, (long)Math.Floor(Math.Floor((double)product.Price / 100) * product.Quantity - discountValue)*100);
            _context.SaveChanges();
        }
        
        return Ok();
    }
    
    [HttpPost("marketing")]
    public async Task<IActionResult> CreateMarketing(UpSertMarketingCouponDtos input)
    {
        if (_context.CouponMarketingInfos.Any(_=>_.CouponId == input.CouponId))
        {
            return BadRequest("You need Cancel To create new campaign");
        }
        var createMarketingCoupon = new CouponMarketingInfo();
        _mapper.Map(input, createMarketingCoupon);
        
        _context.CouponMarketingInfos.Add(createMarketingCoupon);
        _context.SaveChanges();
            
        var userList = _context.Users.ToList();
            
        foreach (var user in userList)
        {
            var roleTemp = await _userManager.GetRolesAsync(user);
            user.Role = roleTemp.FirstOrDefault();
        }

        var memberUsers = userList.Where(_ => _.Role == "Member").ToList();

        var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.Id == input.CouponId);
        if (coupon == null)
            return BadRequest();
        
        var mails = new List<AutomationMail>();
        foreach (var user in memberUsers)
        {
            if (user.Email != null)
            {
                var marketingMail = await System.IO.File.ReadAllTextAsync("Emails/Marketing/index.html");
                marketingMail = marketingMail.Replace("[[Name]]", user.UserName);
                marketingMail = marketingMail.Replace("[[Description]]", input.Description);
                marketingMail = marketingMail.Replace("[[Coupon]]", coupon.CouponCode);
                marketingMail = marketingMail.Replace("[[Discount]]", coupon.DiscountValue.ToString());
                
                var mail = new AutomationMail()
                {
                    Subject = input.Subject,
                    CouponInfoId = createMarketingCoupon.Id,
                    Content = marketingMail,
                    Gmail = user.Email,
                    ScheduleOn = input.ScheduleOn,
                    Status = "Pending"
                };
                
                mails.Add(mail);
            }
        }
        
        _context.AutomationMails.AddRange(mails);
        _context.SaveChanges();

        return Ok(createMarketingCoupon);
    }

    [HttpDelete("marketing/{id:int}")]
    public async Task<IActionResult> CancelMarketing([FromRoute] int id)
    {
        var mailAutomation = _context.AutomationMails.Where(_ => _.CouponInfoId == id).ToList();
        _context.AutomationMails.RemoveRange(mailAutomation);

        var mailInfo = _context.CouponMarketingInfos.Find(id);
        _context.CouponMarketingInfos.Remove(mailInfo);

        _context.SaveChanges();
        return Ok();
    }
}