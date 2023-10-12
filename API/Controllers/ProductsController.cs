using System.Data;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.RequestHelpers;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace API.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        private readonly ImageService _imageService;
        public ProductsController(StoreContext context, IMapper mapper, ImageService imageService)
        {
            _imageService = imageService;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<Product>>> GetProducts([FromQuery] ProductParams productParams)
        {
            var query = _context.Products
                .Sort(productParams.OrderBy)
                .Search(productParams.SearchTerm)
                .Filter(productParams.Brands, productParams.Types)
                .AsQueryable();

            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber,
                productParams.PageSize);

            Response.AddPaginationHeader(products.MetaData);

            return products;
        }

        [HttpGet("{id}", Name = "GetProduct")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            return product;
        }

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var brands = await _context.Products.Select(p => p.Brand).Distinct().ToListAsync();
            var types = await _context.Products.Select(p => p.Type).Distinct().ToListAsync();

            return Ok(new { brands, types });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto)
        {
            var product = _mapper.Map<Product>(productDto);

            if (productDto.File != null)
            {
                var imageResult = await _imageService.AddImageAsync(productDto.File);

                if (imageResult.Error != null)
                    return BadRequest(new ProblemDetails { Title = imageResult.Error.Message });

                product.PictureUrl = imageResult.SecureUrl.ToString();
                product.PublicId = imageResult.PublicId;
            }

            _context.Products.Add(product);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetProduct", new { Id = product.Id }, product);

            return BadRequest(new ProblemDetails { Title = "Problem creating new product" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult<Product>> UpdateProduct([FromForm]UpdateProductDto productDto)
        {
            var product = await _context.Products.FindAsync(productDto.Id);

            if (product == null) return NotFound();

            _mapper.Map(productDto, product);

            if (productDto.File != null)
            {
                var imageUploadResult = await _imageService.AddImageAsync(productDto.File);

                if (imageUploadResult.Error != null) 
                    return BadRequest(new ProblemDetails { Title = imageUploadResult.Error.Message });

                if (!string.IsNullOrEmpty(product.PublicId)) 
                    await _imageService.DeleteImageAsync(product.PublicId);

                product.PictureUrl = imageUploadResult.SecureUrl.ToString();
                product.PublicId = imageUploadResult.PublicId;
            }

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok(product);

            return BadRequest(new ProblemDetails { Title = "Problem updating product" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            if (!string.IsNullOrEmpty(product.PublicId)) 
                await _imageService.DeleteImageAsync(product.PublicId);

            _context.Products.Remove(product);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem deleting product" });
        }
        
        [HttpGet("available-fields")]
        public IActionResult GetAvailableFields()
        {
            List<string> availableFields = GetFields();
            return Ok(availableFields);
        }
                 
        [HttpPost("upload-excel")]
        public async Task<IActionResult> UploadExcelFile([FromForm] UploadExcelModel model)
        {
            try
            {
                if (model.file == null || model.file.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }
         
                var result = await UploadExcel(model.file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Handle exceptions and return an error response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
         
        [HttpPost("final-upload-excel")]
        public async Task<IActionResult> ImportExcelFile([FromForm] ImportExcelModel model)
        {
            try
            {
                if (model.file == null || model.file.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }
         
                var result = await ImportExcel(model.file, model.mapping);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Handle exceptions and return an error response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        private List<string> GetFields()
        {
            return new List<string>(){"Name", "Description", "BasePrice", "Price", "Type", "Brand", "QuantityInStock"};
        }

         private async Task<List<Dictionary<string, string>>> UploadExcel(IFormFile file)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage(file.OpenReadStream()))
            {
                var worksheet = package.Workbook.Worksheets[0];

                // Extract data into a list of dictionaries
                var data = new List<Dictionary<string, string>>();
                for (var rowNumber = 1; rowNumber <= worksheet.Dimension.End.Row; rowNumber++)
                {
                    var row = worksheet.Cells[rowNumber, 1, rowNumber, worksheet.Dimension.End.Column];
                    var rowData = new Dictionary<string, string>();
                    foreach (var cell in row)
                    {
                        rowData[cell.Start.Column.ToString()] = cell.Text;
                    }
                    data.Add(rowData);
                }

                return data;
            }
        }

        private async Task<List<Product>> ImportExcel(IFormFile file, string mapping)
        {
            // Load the Excel file using EPPlus
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage(file.OpenReadStream()))
            {
                var worksheet = package.Workbook.Worksheets[0];

                // Extract data into a DataTable
                DataTable dt = new DataTable();
                foreach (var firstRowCell in worksheet.Cells[1, 1, 1, worksheet.Dimension.End.Column])
                {
                    dt.Columns.Add(firstRowCell.Text);
                }

                for (var rowNumber = 2; rowNumber <= worksheet.Dimension.End.Row; rowNumber++)
                {
                    var row = worksheet.Cells[rowNumber, 1, rowNumber, worksheet.Dimension.End.Column];
                    var newRow = dt.NewRow();
                    var count = 0;
                    foreach (var cell in row)
                    {
                        newRow[count] = cell.Text;
                        count++;
                    }
                    
                    dt.Rows.Add(newRow);
                }

                // Deserialize the mapping string into a C# object
                var userMapping =
                    Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(mapping);

                // Map Excel columns to appropriate fields
                var mappedData = new List<Product>();
                foreach (DataRow row in dt.Rows)
                {
                    var item = new Product();
                    item.PictureUrl =
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png";

                    foreach (var mappingEntry in userMapping)
                    {
                        var excelColumn = mappingEntry.Value;
                        var dataField = mappingEntry.Key;

                        // Map Excel data to the corresponding field
                        if (dt.Columns.Contains(excelColumn))
                        {
                            var value = row[excelColumn].ToString();

                            var propertyInfo = typeof(Product).GetProperty(dataField);
                            if (propertyInfo?.PropertyType == typeof(int))
                            {
                                int intValue;
                                if (int.TryParse(value, out intValue))
                                {
                                    // Successfully converted to int
                                    propertyInfo.SetValue(item, intValue);
                                }
                                else
                                {
                                    propertyInfo.SetValue(item, -1);
                                }
                            }
                            else if (propertyInfo?.PropertyType == typeof(long))
                            {
                                int intValue;
                                if (int.TryParse(value, out intValue))
                                {
                                    // Successfully converted to int
                                    propertyInfo.SetValue(item, intValue);
                                }
                                else
                                {
                                    propertyInfo.SetValue(item, -1);
                                }
                            }
                            else
                            {
                                propertyInfo?.SetValue(item, value);
                            }
                        }
                    }

                    mappedData.Add(item);
                }

                var validData = new List<Product>();
                // Process and validate the data as needed and save
                foreach (var data in mappedData)
                {
                    if (CheckValidData(data))
                    {
                        validData.Add(data);
                    }
                }
                
                await _context.Products.AddRangeAsync(validData);
                await _context.SaveChangesAsync();

                return mappedData;
            }
        }

        private bool CheckValidData(Product product)
        {
            return !string.IsNullOrEmpty(product.Name) 
                   && !string.IsNullOrEmpty(product.Description) 
                   && product.BasePrice > 0 
                   && product.Price > 0 
                   && !string.IsNullOrEmpty(product.Type)
                   && !string.IsNullOrEmpty(product.Brand)
                   && product.QuantityInStock > 0;
        }
    }
}