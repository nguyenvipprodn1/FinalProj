namespace API.DTOs;

public class ImportExcelModel
{
    public IFormFile file { get; set; }
    public string mapping { get; set; }
}