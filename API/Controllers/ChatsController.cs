using API.Entities;
using API.Services;
using API.DTOs.Chats;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ChatsController : BaseApiController
    {
        private readonly ChatService _chatService;
        private readonly UserManager<User> _userManager;

        public ChatsController(ChatService chatService, UserManager<User> userManager)
        {
            _chatService = chatService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            var res = await _chatService.GetChatByUserId(user.Id);
            return Ok(res);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(CreateChatRequest model)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            var res = await _chatService.Create(model.PartnerId, user.Id);
            return Ok(res.CreateChatResponseModels);
        }
        
        [HttpGet("messages/{id:int}/{page:int}")]
        public async Task<IActionResult> GetAll(int id, int page)
        {
            var res = await _chatService.Messages(id, page);
            return Ok(res);
        }
        
        [HttpPost("upload-image")]
        public async Task<IActionResult> UpLoadImage([FromForm] UploadImageRequest model)
        {
            var res = await _chatService.UpLoadImage(model.image);
            return Ok(res);
        }
        
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var res = await _chatService.Delete(id);
            return Ok(res);
        }
        
        [HttpPost("add-user-to-group")]
        public async Task<IActionResult> AddUserToGroup(AddUserToGroupRequest model)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            var res = await _chatService.AddUserToGroup(model.ChatId, model.UserId, user.Id);
            return Ok(res);
        }
        
        [HttpPost("leave-current-chat")]
        public async Task<IActionResult> LeaveGroup(LeaveGroupRequest model)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            var res = await _chatService.LeaveCurrentChat(model.ChatId, user.Id);
            return Ok(res);
        }
    }
}