using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class User : IdentityUser<int>
    {
        public UserAddress Address { get; set; }
        [NotMapped] public string Role { get; set; }
    }
}