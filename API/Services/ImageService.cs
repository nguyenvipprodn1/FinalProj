using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace API.Services
{
    public class ImageService
    {
        private readonly Cloudinary _cloudinary;

        public ImageService()
        {
            var acc =new Account("dvvisbptn", "983423172777185", "VjY7coNqX01EOFlEXYHX0tDBdDE");

            _cloudinary = new Cloudinary(acc);
        }

        public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream)
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;
        }
        public async Task<DeletionResult> DeleteImageAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);

            var result = await _cloudinary.DestroyAsync(deleteParams);

            return result;
        }
    }
}