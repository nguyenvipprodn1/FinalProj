import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chats: [],
    currentChat: {},
    socket: {},
    newMessage: { chatId: null, seen: null },
    scrollBottom: 0,
    senderTyping: { typing: false },
};

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        fetchChats: (state, action) => {
            action.payload.forEach(chat => {
                chat.users.forEach(user => {
                    user.status = 'offline'
                })
                chat.messages.reverse()
            })
            state.chats = action.payload;
        },
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
            state.scrollBottom += 1;
            state.newMessage = { chatId: null, seen: null };
        },
        onlineFriends: (state, action) => {
            const { payload: friends } = action;
            // Update the status of friends who are online
            state.chats.forEach((chat) => {
                chat.users.forEach((user) => {
                    if (friends.includes(user.id)) {
                        user.status = "online";
                    }
                });
            });
        },
        onlineFriend: (state, action) => {
            const { payload: friend } = action;
            // Update the online status of the friend
            state.chats.forEach((chat) => {
                chat.users.forEach((user) => {
                    if (user.id === friend.id) {
                        user.status = "online";
                    }
                });
            });

            // Update the currentChat if the friend is in it
            if (state.currentChat.users) {
                state.currentChat.users.forEach((user) => {
                    if (user.id === friend.id) {
                        user.status = "online";
                    }
                });
            }
        },
        offlineFriend: (state, action) => {
            const { payload: friend } = action;
            // Update the offline status of the friend
            state.chats.forEach((chat) => {
                chat.users.forEach((user) => {
                    if (user.id === friend.id) {
                        user.status = "offline";
                    }
                });
            });

            // Update the currentChat if the friend is in it
            if (state.currentChat.users) {
                state.currentChat.users.forEach((user) => {
                    if (user.id === friend.id) {
                        user.status = "offline";
                    }
                });
            }
        },
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        receivedMessage: (state, action) => {
            const { userId, message } = action.payload;
            let currentChatCopy = { ...state.currentChat };
            let newMessage = { ...state.newMessage };
            let scrollBottom = state.scrollBottom;

            const chatsCopy = state.chats.map((chat) => {
                if (message.chatId === chat.id) {
                    if (message.user.id === userId) {
                        scrollBottom++;
                    } else {
                        newMessage = {
                            chatId: chat.id,
                            seen: false,
                        };
                    }

                    if (message.chatId === currentChatCopy.id) {
                        currentChatCopy = {
                            ...currentChatCopy,
                            messages: [...currentChatCopy.messages, message],
                        };
                    }

                    return {
                        ...chat,
                        messages: [...chat.messages, message],
                    };
                }

                return chat;
            });

            if (scrollBottom === state.scrollBottom) {
                state.chats = chatsCopy;
                state.currentChat= currentChatCopy;
                state.newMessage = newMessage;
                state.senderTyping = { typing: false };
            }else {
                // Update the state object based on the condition
                state.chats = chatsCopy;
                state.currentChat = currentChatCopy;
                state.newMessage = newMessage;
                state.senderTyping = { typing: false };
                state.scrollBottom = scrollBottom;
            }
        },
        senderTyping: (state, action) => {
            const { typing } = action.payload;

            if (typing) {
                state.senderTyping = action.payload;
                state.scrollBottom += 1;
            } else {
                state.senderTyping = action.payload;
            }
        },
        paginateMessages: (state, action) => {
            const { messages, id, pagination } = action.payload;

            // Check if messages is defined and has a length greater than 0
            if (typeof messages !== "undefined" && messages.length > 0) {
                // Reverse the messages
                messages.reverse();

                // Modify state based on the action payload
                let currentChatCopy = state.currentChat;
                const chatsCopy = state.chats.map((chat) => {
                    if (chat.id === id) {
                        const shifted = [...messages, ...chat.messages];
                        currentChatCopy = {
                            ...currentChatCopy,
                            messages: shifted,
                            Pagination: pagination,
                        };

                        return {
                            ...chat,
                            messages: shifted,
                            Pagination: pagination,
                        };
                    }

                    return chat;
                });


                state.chats = chatsCopy;
                state.currentChat = currentChatCopy;
            }
        },
        incrementScroll: (state) => {
            state.scrollBottom += 1;
            state.newMessage = { chatId: null, seen: true };
        },
        createChat: (state, action) => {
            const chat = action.payload;

            // Update the state to include the new chat
            state.chats.push(chat);
        },
        addUserToGroup: (state, action) => {
            const { chat, chatters } = action.payload;

            let exists = false;

            // Create a copy of the chats with the updated users
            const chatsCopy = state.chats.map((chatState) => {
                if (chat.id === chatState.id) {
                    exists = true;
                    return {
                        ...chatState,
                        users: [...chatState.users, ...chatters],
                    };
                }
                return chatState;
            });

            // If the chat does not exist, add it to the chats array
            if (!exists) {
                chatsCopy.push(chat);
            }

            // Update the currentChat if it matches the chat being updated
            let currentChatCopy = state.currentChat;
            if (Object.keys(currentChatCopy).length > 0) {
                if (chat.id === currentChatCopy.id) {
                    currentChatCopy = {
                        ...currentChatCopy,
                        users: [...currentChatCopy.users, ...chatters],
                    };
                }
            }

            // Update the state with the new chats and currentChat
            state.chats = chatsCopy;
            state.currentChat = currentChatCopy;
        },
        leaveCurrentChat: (state, action) => {
            const { chatId, userId, currentUserId } = action.payload;

            if (userId === currentUserId) {
                // If the user leaving the chat is the current user, remove the chat from chats
                state.chats = state.chats.filter((chat) => chat.id !== chatId);

                // Check if the currentChat is the chat being left and clear it if needed
                if (state.currentChat.id === chatId) {
                    state.currentChat = {};
                }
            } else {
                // If another user is leaving the chat, update the users list
                state.chats = state.chats.map((chat) => {
                    if (chatId === chat.id) {
                        chat.users = chat.users.filter((user) => user.id !== userId);
                    }
                    return chat;
                });

                // Check if the currentChat is the chat being left and update its users list
                if (state.currentChat.id === chatId) {
                    state.currentChat.users = state.currentChat.users.filter(
                        (user) => user.id !== userId
                    );
                }
            }
        },
        deleteCurrentChat: (state, action) => {
            const chatId = action.payload;

            // Remove the chat from chats
            state.chats = state.chats.filter((chat) => chat.id !== chatId);

            // Check if the currentChat is the chat being deleted and clear it if needed
            if (state.currentChat.id === chatId) {
                state.currentChat = {};
            }
        },
    },
});

export const {
    fetchChats,
    setCurrentChat,
    onlineFriends,
    onlineFriend,
    offlineFriend,
    setSocket,
    receivedMessage,
    senderTyping,
    paginateMessages,
    incrementScroll,
    createChat,
    addUserToGroup,
    leaveCurrentChat,
    deleteCurrentChat
} = chatSlice.actions;
