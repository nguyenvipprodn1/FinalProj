using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class updatebasket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CouponId",
                table: "BasketItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FinalPrice",
                table: "BasketItems",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CouponId",
                table: "BasketItems");

            migrationBuilder.DropColumn(
                name: "FinalPrice",
                table: "BasketItems");
        }
    }
}
