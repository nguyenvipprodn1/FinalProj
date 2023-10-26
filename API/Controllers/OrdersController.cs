using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly StoreContext _context;
        private readonly SendMailBusinessService _emailService;

        public OrdersController(StoreContext context, SendMailBusinessService emailService, UserManager<User> userManager)
        {
            _context = context;
            _emailService = emailService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            var orders = await _context.Orders
                .ProjectOrderToOrderDto()
                .Where(x => x.BuyerId == User.Identity.Name)
                .ToListAsync();

            return orders;
        }

        [HttpGet("{id}", Name = "GetOrder")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            return await _context.Orders
                .ProjectOrderToOrderDto()
                .FirstOrDefaultAsync(x => x.BuyerId == User.Identity.Name && x.Id == id);
        }
 
        [HttpPost]
        public async Task<ActionResult<int>> CreateOrder(CreateOrderDto orderDto)
        {
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name)
                .FirstOrDefaultAsync();

            if (basket == null) return BadRequest(new ProblemDetails 
            { 
                Title = "Could not find basket" 
            });

            var items = new List<OrderItem>();

            foreach (var item in basket.Items)
            {
                var productItem = await _context.Products.FindAsync(item.ProductId);
                if (item.CouponId != null)
                {
                    var coupon = _context.ProductDiscounts.FirstOrDefault(_ => _.Id == item.CouponId);
                    if (coupon != null && coupon.IsActive)
                    {
                        coupon.DiscountUnit -= 1;
                        _context.SaveChanges();
                        
                        var discountValue = Math.Min(coupon.MaximumDiscountAmount,  Math.Floor((double)productItem.Price / 100) * coupon.DiscountValue/100);
                        productItem.Price = (long)Math.Floor(Math.Floor((double)productItem.Price / 100) - discountValue)*100;
                    }
                   
                }
                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = productItem.Id,
                    Name = productItem.Name,
                    PictureUrl = productItem.PictureUrl
                };
                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Quantity = item.Quantity
                };
                items.Add(orderItem);
                productItem.QuantityInStock -= item.Quantity;
            }

            var subtotal = items.Sum(item => item.Price * item.Quantity);
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            var order = new Order
            {
                OrderItems = items,
                BuyerId = User.Identity.Name,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                DeliveryFee = deliveryFee,
                PaymentIntentId = basket.PaymentIntentId
            };

            _context.Orders.Add(order);
            _context.Baskets.Remove(basket);

            if (orderDto.SaveAddress)
            {
                var user = await _context.Users
                    .Include(a => a.Address)
                    .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

                var address = new UserAddress
                {
                    FullName = orderDto.ShippingAddress.FullName,
                    Address1 = orderDto.ShippingAddress.Address1,
                    Address2 = orderDto.ShippingAddress.Address2,
                    City = orderDto.ShippingAddress.City,
                    State = orderDto.ShippingAddress.State,
                    Zip = orderDto.ShippingAddress.Zip,
                    Country = orderDto.ShippingAddress.Country
                };
                user.Address = address;
            }

            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                await SendMailConfirmOrder(items, subtotal.ToString());
                return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);
            }

            return BadRequest("Problem creating order");
        }

        private async Task SendMailConfirmOrder(List<OrderItem> items, string totalPrice)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            
            var message = await System.IO.File.ReadAllTextAsync("Emails/ConfirmOrders/index.html");
            message = message.Replace("[[Date]]", DateTime.Today.ToLongDateString());
            message = message.Replace("[[Name]]", user.UserName);

            string productBuilder = "";
            foreach (var item in items)
            {
                var product = await System.IO.File.ReadAllTextAsync("Emails/ConfirmOrders/product.html");
                product = product.Replace("[[ProductName]]", item.ItemOrdered.Name);
                product = product.Replace("[[ProductPrice]]", item.Price.ToString());
                var pd = await _context.Products.FindAsync(item.ItemOrdered.ProductId);
                product = product.Replace("[[ProductImage]]",pd.PictureUrl);
                
                productBuilder += product;
            }

            message = message.Replace("[[Product]]", productBuilder);
            
            var total = await System.IO.File.ReadAllTextAsync("Emails/ConfirmOrders/total.html");
            total = total.Replace("[[TotalValue]]", totalPrice);
            
            message = message.Replace("[[Total]]", total);
            
            await _emailService.SendEmailAsync(user.Email, "Order Confirm", message);
        }
    }
}