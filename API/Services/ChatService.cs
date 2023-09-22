using API.Data;
using API.Entities;
using API.DTOs.Chats;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class ChatService
{
    private readonly StoreContext _context;
    private readonly ImageService _imageServices;

    public ChatService(
        StoreContext context,
        ImageService imageServices
    )
    {
        _context = context;
        _imageServices = imageServices;
    }

    public async Task<List<GetChatByUserIdResponse>> GetChatByUserId(int id)
    {
        var chatUsers = _context.ChatUsers.Where(_ => _.UserId == id).ToList(); // 
        var chatUsersContainChatWithUsersTakeChatId = chatUsers.Select(_ => _.ChatId).Distinct().ToList();
        var chatUsersContainChatWithUsers =
            _context.ChatUsers.Where(_ => chatUsersContainChatWithUsersTakeChatId.Contains(_.ChatId)).ToList();
        var chatIds = chatUsers.Select(_ => _.ChatId).Distinct().ToList(); // 
        var chats = _context.Chats.Where(_ => chatIds.Contains(_.Id)).ToList(); // 
        var userIds = chatUsersContainChatWithUsers.Select(_ => _.UserId).Distinct().ToList(); // 
        var users = _context.Users.Where(_ => userIds.Contains(_.Id)).ToList(); // 
        var messages = _context.ChatMessages
            .OrderByDescending(x=>x.CreateAt)
            .Where(_ => chatIds.Contains(_.ChatId)).Take(20).Skip(0)
            .ToList();
        var res = new List<GetChatByUserIdResponse>();

        foreach (var chat in chats)
        {
            var chatUser = chatUsers.FirstOrDefault(_ => _.UserId == id && _.ChatId == chat.Id); // 
            var userIdsChatWith = chatUsersContainChatWithUsers.Where(_ => _.ChatId == chat.Id && _.UserId != id)
                .Select(_ => _.UserId).ToList(); // 
            var usersChatWith = users.Where(_ => userIdsChatWith.Contains(_.Id)).ToList(); //
            var userResponseList = new List<UserResponse>();

            foreach (var user in usersChatWith)
            {
                var chatUserInUser =
                    chatUsersContainChatWithUsers.FirstOrDefault(_ => _.ChatId == chat.Id && _.UserId == user.Id);
                if (chatUserInUser != null)
                {
                    var userName = user.UserName.Split(" ");
                    var userResponse = new UserResponse()
                    {
                        Id = user.Id,
                        Avatar = string.Empty,
                        FirstName = userName.Length == 2 ? userName[1] : "",
                        LastName = userName[0],
                        Email = user.Email,
                        ChatUser = new ChatUserResponse()
                        {
                            ChatId = chatUserInUser.ChatId,
                            UserId = chatUserInUser.UserId,
                        }
                    };
                    userResponseList.Add(userResponse);
                }
            }

            var mess = messages.Where(_ => _.ChatId == chat.Id).ToList();
            var messageResponseList = new List<MessageResponse>();
            foreach (var m in mess)
            {
                var userWroteMessage = users.FirstOrDefault(_ => _.Id == m.FromUserId);
                if (userWroteMessage != null)
                {
                    var userName = userWroteMessage.UserName.Split(" ");
                    var messageResponse = new MessageResponse()
                    {
                        Id = m.Id,
                        Type = m.Type,
                        Message = m.Message,
                        ChatId = m.ChatId,
                        FromUserId = m.FromUserId,
                        CreatedAt = m.CreateAt,
                        UpdatedAt = m.CreateAt,
                        User = new UserInMessage()
                        {
                            Id = userWroteMessage.Id,
                            Avatar = string.Empty,
                            FirstName = userName.Length == 2 ? userName[1] : "",
                            LastName = userName[0],
                            Email = userWroteMessage.Email,
                        }
                    };
                    messageResponseList.Add(messageResponse);
                }
            }

            if (chatUser != null)
            {
                var result = new GetChatByUserIdResponse()
                {
                    Id = chat.Id,
                    Type = chat.Type,
                    ChatUser = new ChatUserResponse()
                    {
                        UserId = chatUser.UserId,
                        ChatId = chatUser.ChatId,
                    },
                    Users = userResponseList,
                    Messages = messageResponseList,
                };
                res.Add(result);
            }
        }

        return res;
    }

    public async Task<CreateChatResponse> Create(int partnerId, int userId)
    {
        var chatUsers = _context.ChatUsers.Where(_ => _.UserId == partnerId || _.UserId == userId).ToList();
        var chatIdInChatUserOfPartner = chatUsers.Where(_ => _.UserId == partnerId).Select(_ => _.ChatId);
        var chatIdInChatUserOfUser = chatUsers.Where(_ => _.UserId == userId).Select(_ => _.ChatId);
        var isChatIdOfUserAndPartnerIntersect = chatIdInChatUserOfPartner.Intersect(chatIdInChatUserOfUser).Any();
        var isChatTypeDual = isChatIdOfUserAndPartnerIntersect
            ? await _context.Chats.CountAsync(_ =>
                chatIdInChatUserOfPartner.Intersect(chatIdInChatUserOfUser).Contains(_.Id) && _.Type == "dual") > 0
            : false;
        var isUserAndPartnerAlreadyChat = isChatIdOfUserAndPartnerIntersect && isChatTypeDual;

        if (isUserAndPartnerAlreadyChat)
            throw new Exception("Chat with this user already exists!");

        var chat = new Chat()
        {
            Type = "dual"
        };

        _context.Chats.Add(chat);
        _context.SaveChanges();

        _context.ChatUsers.AddRange(new List<ChatUser>()
        {
            new ChatUser()
            {
                UserId = userId,
                ChatId = chat.Id
            },
            new ChatUser()
            {
                UserId = partnerId,
                ChatId = chat.Id
            }
        });

        _context.SaveChanges();
        
        var userInfos = _context.Users.Where(_ => _.Id == userId || _.Id == partnerId).ToList();
        var userInfo = userInfos.FirstOrDefault(_ => _.Id == userId);
        var partnerInfo = userInfos.FirstOrDefault(_ => _.Id == partnerId);

        var userName = partnerInfo.UserName.Split(" ");
        var forCreator = new CreateChatResponseModel()
        {
            Id = chat.Id,
            Type = "dual",
            Users = new List<UserInMessage>()
            {
                new UserInMessage()
                {
                    Id = partnerInfo.Id,
                    Avatar = string.Empty,
                    FirstName = userName.Length == 2 ? userName[1] : "",
                    LastName = userName[0],
                    Email = partnerInfo.Email,
                }
            },
        };

        var userNameOfUser = userInfo.UserName.Split(" ");
        var forReceiver = new CreateChatResponseModel()
        {
            Id = chat.Id,
            Type = "dual",
            Users = new List<UserInMessage>()
            {
                new UserInMessage()
                {
                    Id = userInfo.Id,
                    Avatar = string.Empty,
                    FirstName = userNameOfUser.Length == 2 ? userNameOfUser[1] : "",
                    LastName = userNameOfUser[0],
                    Email = userInfo.Email
                }
            },
        };

        return new CreateChatResponse()
        {
            CreateChatResponseModels = new List<CreateChatResponseModel>() { forCreator, forReceiver }
        };
    }

    public async Task<object> Messages(int id, int page = 1)
    {
        var limit = 10;
        var offset = page > 1 ? page * limit : 0;
        var totalMessages = await _context.ChatMessages.CountAsync(_ => _.ChatId == id);
        var totalPages = Math.Ceiling(Convert.ToDecimal(totalMessages / limit));
        var messages = _context.ChatMessages
            .Where(_ => _.ChatId == id)
            .ToList();
        messages = messages.OrderByDescending(_ => _.CreateAt).ToList();
        messages = messages.Skip(offset).Take(limit).ToList();
        
        if (page > totalPages)
            return new { data = new { messages = new List<MessageResponse>() } };

        var messageResponses = new List<MessageResponse>();

        var fromUserIds = messages.Select(_ => _.FromUserId).ToList();
        var userInfos = _context.Users.Where(_ => fromUserIds.Contains(_.Id)).ToList();
        foreach (var m in messages)
        {
            var userInfo = userInfos.FirstOrDefault(_ => _.Id == m.FromUserId);
            var userName = userInfo.UserName.Split(" ");
            var messageResponse = new MessageResponse()
            {
                Id = m.Id,
                Type = m.Type,
                Message = m.Message,
                ChatId = m.ChatId,
                FromUserId = m.FromUserId,
                CreatedAt = m.CreateAt,
                UpdatedAt = m.CreateAt,
                User = new UserInMessage()
                {
                    Id = userInfo.Id,
                    Avatar = string.Empty,
                    FirstName = userName.Length == 2 ? userName[1] : "",
                    LastName = userName[0],
                    Email = userInfo.Email,
                }
            };
            messageResponses.Add(messageResponse);
        }

        return new { messages = messageResponses, pagination = new { page = page, totalPages = totalPages } };
    }

    public async Task<object> AddUserToGroup(int chatId, int userId, int currentUserId)
    {
        var chatUser = _context.ChatUsers.Where(_ => _.ChatId == chatId).ToList();
        if (chatUser.Any(_ => _.UserId == userId))
            throw new Exception("User already in the group!");

        _context.ChatUsers.Add(new ChatUser()
        {
            ChatId = chatId,
            UserId = userId
        });

        _context.SaveChanges();

        var chat = await _context.Chats.FindAsync(chatId);
        if (chat.Type == "dual")
        {
            chat.Type = "group";
            _context.Chats.Update(chat); 
            _context.SaveChanges();
        }
           

        var messages = _context.ChatMessages.Where(_ => _.ChatId == chatId).ToList();

        var messageResponses = new List<MessageResponse>();

        var chatUsers = _context.ChatUsers.Where(_ => _.ChatId == chatId).ToList();
        var fromUserIds = chatUsers.Select(_ => _.UserId).ToList();
        var userInfos = _context.Users.Where(_ => fromUserIds.Contains(_.Id) || _.Id == userId);
        foreach (var m in messages)
        {
            var userInfo = userInfos.FirstOrDefault(_ => _.Id == m.FromUserId);
             var userName = userInfo.UserName.Split(" ");
            var messageResponse = new MessageResponse()
            {
                Id = m.Id,
                Type = m.Type,
                Message = m.Message,
                ChatId = m.ChatId,
                FromUserId = m.FromUserId,
                CreatedAt = m.CreateAt,
                UpdatedAt = m.CreateAt,
                User = new UserInMessage()
                {
                    Id = userInfo.Id,
                    Avatar = string.Empty,
                    FirstName = userName.Length == 2 ? userName[1] : "",
                    LastName = userName[0],
                    Email = userInfo.Email,
                }
            };
            messageResponses.Add(messageResponse);
        }

        var userResponseList = new List<UserResponse>();

        foreach (var user in userInfos)
        {
            var userName = user.UserName.Split(" ");
            var userResponse = new UserResponse()
            {
                Id = user.Id,
                Avatar = string.Empty,
                FirstName = userName.Length == 2 ? userName[1] : "",
                LastName = userName[0],
                Email = user.Email,
                ChatUser = new ChatUserResponse()
                {
                    ChatId = chatId,
                    UserId = userId,
                }
            };
            userResponseList.Add(userResponse);
        }

        var newChatter = userInfos.FirstOrDefault(_ => _.Id == userId);
        var userNameChatter = newChatter.UserName.Split(" ");
        return new
        {
            Chat = new
            {
                Id = chat.Id,
                Type = "group",
                Users = userResponseList,
                Messages = messageResponses,
            },
            NewChatter = new UserInMessage()
            {
                Id = newChatter.Id,
                Avatar = string.Empty,
                FirstName = userNameChatter.Length == 2 ? userNameChatter[1] : "",
                LastName = userNameChatter[0],
                Email = newChatter.Email,
            }
        };
    }

    public async Task<object> Delete(int chatId)
    {
        var chatUser = _context.ChatUsers.Where(_ => _.ChatId == chatId).ToList();
        var chatUsersToDelete = _context.ChatUsers.Where(_ => _.ChatId == chatId).ToList();
        _context.ChatUsers.RemoveRange(chatUsersToDelete);
        
        var messagesToDelete = _context.ChatMessages.Where(_ => _.ChatId == chatId).ToList();
        _context.ChatMessages.RemoveRange(messagesToDelete);
        
        var chatsToDelete = _context.Chats.Where(_ => _.Id == chatId).ToList();
        _context.Chats.RemoveRange(chatsToDelete);

        _context.SaveChanges();
        return new { ChatId = chatId, NotifyUsers = chatUser.Select(_ => _.UserId) };
    }

    public async Task<object> LeaveCurrentChat(int chatId, int currentUserId)
    {
        var chatUsers = _context.ChatUsers.Where(_ => _.ChatId == chatId).ToList();

        if (chatUsers.Count == 2)
            throw new Exception("You cannot leave this chat");

        if (chatUsers.Count == 3)
        {
            var chat = _context.Chats.Find(chatId);
            chat.Type = "dual";
            _context.Chats.Update(chat);
            _context.SaveChanges();
        }

        var chatUsersToDelete = _context.ChatUsers.Where(_ => _.ChatId == chatId && _.UserId == currentUserId).ToList();
        _context.ChatUsers.RemoveRange(chatUsersToDelete);
        
        var messagesToDelete = _context.ChatMessages.Where(_ => _.ChatId == chatId && _.FromUserId == currentUserId).ToList();
        _context.ChatMessages.RemoveRange(messagesToDelete);

        _context.SaveChanges();

        return new
        {
            ChatId = chatId,
            UserId = currentUserId,
            CurrentUserId = currentUserId,
            NotifyUsers = chatUsers.Select(_ => _.UserId)
        };
    }

    public async Task<object> UpLoadImage(IFormFile image)
    {
        var uploadResult = await _imageServices.AddImageAsync(image);
        return new { Url = uploadResult.Url.ToString() };
    }
}