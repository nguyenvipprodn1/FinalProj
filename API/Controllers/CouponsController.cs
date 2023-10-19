using API.Data;
using API.DTOs;
using API.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CouponsController: BaseApiController
{
    private readonly StoreContext _context;
    private readonly IMapper _mapper;
    public CouponsController(StoreContext context, IMapper mapper)
    {
        _mapper = mapper;
        _context = context;
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
    
}