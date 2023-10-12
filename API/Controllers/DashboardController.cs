using API.Data;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class DashboardController : BaseApiController
{
    private readonly StoreContext _context;

    public DashboardController(StoreContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        return Ok();
    }
}