using API.Data;
using API.DTOs.Chats;
using API.Entities;
using API.DTOs.Chats.SignalRChatVM;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class ChatHub : Hub
{
    private readonly IDictionary<int, UserConnection> users;
    private readonly IDictionary<string, int> userSockets;
    private readonly StoreContext _context;

    public ChatHub(StoreContext context,
        IDictionary<int, UserConnection> _users, 
        IDictionary<string, int> _userSockets)
    {
        _context = context;
        users = _users;
        userSockets = _userSockets;
    }


    public async Task Join(UserResponse user)
    {
        var sockets = new HashSet<string>();

        if (users.ContainsKey(user.Id))
        {
            var existingUser = users[user.Id];
            if (!existingUser.Sockets.Contains(Context.ConnectionId))
                existingUser.Sockets.Add(Context.ConnectionId);

            users[user.Id] = existingUser;
            sockets = existingUser.Sockets;
            userSockets[Context.ConnectionId] = user.Id;
        }
        else
        {
            users[user.Id] = new UserConnection
                { Id = user.Id, Sockets = new HashSet<string> { Context.ConnectionId } };
            sockets.Add(Context.ConnectionId);
            userSockets[Context.ConnectionId] = user.Id;
        }

        var onlineFriends = new HashSet<int>();

        var chatters = await GetChattersAsync(user.Id);

        foreach (var chatterId in chatters)
        {
            if (users.ContainsKey(chatterId))
            {
                var chatter = users[chatterId];
                foreach (var socket in chatter.Sockets)
                {
                    try
                    {
                        await Clients.Client(socket).SendAsync("online", user);
                    }
                    catch (Exception)
                    {
                    }
                }

                onlineFriends.Add(chatter.Id);
            }
        }

        foreach (var socket in sockets)
        {
            try
            {
                await Clients.Client(socket).SendAsync("friends", onlineFriends);
            }
            catch (Exception)
            {
            }
        }
    }

    public async Task Message(MessageSocket message)
    {
        var sockets = new HashSet<string>();

        if (users.ContainsKey(message.FromUser.Id))
        {
            foreach (var socket in users[message.FromUser.Id].Sockets)
            {
                sockets.Add(socket);
            }
        }

        foreach (var id in message.ToUserId)
        {
            if (users.ContainsKey(id))
            {
                foreach (var socket in users[id].Sockets)
                {
                    sockets.Add(socket);
                }
            }
        }

        try
        {
            var msg = new ChatMessage()
            {
                Type = message.Type,
                FromUserId = message.FromUser.Id,
                ChatId = message.ChatId,
                Message = message.Message,
            };

            _context.ChatMessages.Add(msg);
            _context.SaveChanges();

            var messageResponse = new MessageResponse()
            {
                Id = msg.Id,
                ChatId = msg.ChatId,
                CreatedAt = msg.CreateAt,
                UpdatedAt = msg.CreateAt,
                Type = msg.Type,
                FromUserId = message.FromUser.Id,
                User = message.FromUser,
                Message = msg.Message
            };

            foreach (var socket in sockets)
            {
                try
                {
                    await Clients.Client(socket).SendAsync("received", messageResponse);
                }
                catch (Exception)
                {
                }
            }
        }
        catch (Exception)
        {
        }
    }

    public async Task Typing(TypingModel model)
    {
        foreach (var id in model.ToUserId)
        {
            if (users.ContainsKey(id))
            {
                var userSockets = users[id].Sockets;
                foreach (var socket in userSockets)
                {
                    try
                    {
                        await Clients.Client(socket).SendAsync("typing", model);
                    }
                    catch (Exception)
                    {
                    }
                }
            }
        }
    }

    public async Task AddFriend(AddFriendModel model)
    {
        try
        {
            string online = "offline";

            if (users.ContainsKey(model.Chats[1].Users[0].Id))
            {
                online = "online";
                model.Chats[0].Users[0].Status = "online";
                var userSockets = users[model.Chats[1].Users[0].Id].Sockets;

                foreach (var socket in userSockets)
                {
                    await Clients.Client(socket).SendAsync("new-chat", model.Chats[0]);
                }
            }

            if (users.ContainsKey(model.Chats[0].Users[0].Id))
            {
                model.Chats[1].Users[0].Status = online;
                var userSockets = users[model.Chats[0].Users[0].Id].Sockets;

                foreach (var socket in userSockets)
                {
                    await Clients.Client(socket).SendAsync("new-chat", model.Chats[1]);
                }
            }
        }
        catch (Exception e)
        {

        }
    }

    public async Task AddUserToGroup(AddUserToGroupModel model)
    {
        if (users.ContainsKey(model.NewChatter.Id))
        {
            model.NewChatter.Status = "online";
        }

        // Update the status of old users and send messages to them
        foreach (var user in model.Chat.Users)
        {
            if (users.ContainsKey(user.Id))
            {
                user.Status = "online";
                var userSockets = users[user.Id].Sockets;

                foreach (var socket in userSockets)
                {
                    await Clients.Client(socket).SendAsync("added-user-to-group", new
                    {
                        chat = model.Chat,
                        chatters = new List<UserInChatSignalR> { model.NewChatter }
                    });
                }
            }
        }

        // Send the updated chat to the new chatter
        if (users.ContainsKey(model.NewChatter.Id))
        {
            var newChatterSockets = users[model.NewChatter.Id].Sockets;

            foreach (var socket in newChatterSockets)
            {
                await Clients.Client(socket).SendAsync("added-user-to-group", new
                {
                    chat = model.Chat,
                    chatters = model.Chat.Users
                });
            }
        }
    }

    public async Task LeaveCurrentChat(LeaveCurrentChatModel model)
    {
        foreach (var id in model.NotifyUsers)
        {
            if (users.ContainsKey(id))
            {
                var userSockets = users[id].Sockets;

                foreach (var socket in userSockets)
                {
                    await Clients.Client(socket).SendAsync("remove-user-from-chat", new
                    {
                        ChatId = model.ChatId,
                        UserId = model.UserId,
                        CurrentUserId = model.CurrentUserId
                    });
                }
            }
        }
    }

    public async Task DeleteChat(DeleteChatModel model)
    {
        foreach (var id in model.NotifyUsers)
        {
            if (users.ContainsKey(id))
            {
                var userSockets = users[id].Sockets;

                foreach (var socket in userSockets)
                {
                    await Clients.Client(socket).SendAsync("delete-chat", model.ChatId);
                }
            }
        }
    }

    public async override Task OnDisconnectedAsync(Exception exception)
    {
        if (userSockets.ContainsKey(Context.ConnectionId))
        {
            var userId = userSockets[Context.ConnectionId];

            if (users.ContainsKey(userId))
            {
                var user = users[userId];

                if (user.Sockets.Count > 1)
                {
                    // Remove the disconnected socket from the user's list of sockets
                    foreach (var socket in user.Sockets)
                    {
                        if (socket == Context.ConnectionId)
                        {
                            user.Sockets.Remove(Context.ConnectionId);
                        }
                    }

                    // Update the user's information
                    users[userId] = user;
                }
                else
                {
                    var chatters = await GetChattersAsync(userId);

                    foreach (var chatterId in chatters)
                    {
                        if (users.ContainsKey(chatterId))
                        {
                            var chatter = users[chatterId];

                            foreach (var socket in chatter.Sockets)
                            {
                                try
                                {
                                    await Clients.Client(socket).SendAsync("offline", user);
                                }
                                catch (Exception)
                                {
                                }
                            }
                        }
                    }

                    // Remove the disconnected user from the dictionaries
                    foreach (var userSocket in userSockets)
                    {
                        if (userSocket.Value == userId)
                        {
                            userSockets.Remove(userSocket);
                        }
                    }

                    foreach (var userToRemove in users)
                    {
                        if (userToRemove.Key == userId)
                        {
                            users.Remove(userId);
                        }
                    }
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task<IEnumerable<int>> GetChattersAsync(int userId)
    {
        var chatUsers = _context.ChatUsers.Where(_ => _.UserId == userId);
        var chatIds = chatUsers.Select(_ => _.ChatId);
        var userIdsChatWith = (_context.ChatUsers.Where(_ => chatIds.Contains(_.ChatId)))
            .Where(_ => _.UserId != userId).Select(_ => _.UserId);
        return userIdsChatWith;
    }
}