using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class StoreContext : IdentityDbContext<User, Role, int>
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductDiscount> ProductDiscounts { get; set; }
        public DbSet<CouponMarketingInfo> CouponMarketingInfos { get; set; }
        public DbSet<AutomationMail> AutomationMails { get; set; }
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Chat> Chats  { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }  
        public DbSet<ChatUser> ChatUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasOne(a => a.Address)
                .WithOne()
                .HasForeignKey<UserAddress>(a => a.Id)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Role>()
                .HasData(
                    new Role {Id = 1, Name = "Member", NormalizedName = "MEMBER" },
                    new Role {Id = 2, Name = "Admin", NormalizedName = "ADMIN" }, 
                    new Role {Id = 3, Name = "Staff", NormalizedName = "STAFF" }
                );
        }
    }
}