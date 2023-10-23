using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
            CreateMap<CouponDtos, ProductDiscount>().ReverseMap();
            CreateMap<UpSertMarketingCouponDtos, CouponMarketingInfo>().ReverseMap();
        }
    }
}