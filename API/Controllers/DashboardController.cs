using API.Data;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class DashboardController : BaseApiController
{
    private readonly StoreContext _context;
    private readonly UserManager<User> _userManager;

    public DashboardController(StoreContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var userList = _context.Users.ToList();
            
        foreach (var user in userList)
        {
            var roleTemp = await _userManager.GetRolesAsync(user);
            user.Role = roleTemp.FirstOrDefault();
        }

        var memberUsers = userList.Where(_ => _.Role == "Member").ToList();
        var totalCustomer = memberUsers.Count();

        var totalProfit = _context.Orders.Sum(_ => _.Subtotal);
        var productRemain = _context.Products.Sum(_ => _.QuantityInStock);
        var productSold = 0;
        var orders = _context.Orders
            .ProjectOrderToOrderDto();
        
        foreach (var item in orders)
        {
            productSold += item.OrderItems.Sum(_ => _.Quantity);
        }
        
        return Ok(new
        {
            customer = totalCustomer,
            totalProfit = totalProfit,
            productRemain = productRemain,
            productSold = productSold
        });
    }
}