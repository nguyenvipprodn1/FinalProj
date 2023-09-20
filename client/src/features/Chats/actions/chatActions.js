export const FETCH_CHATS = 'FETCH_CHATS'
export const SET_CURRENT_CHAT = 'SET_CURRENT_CHAT'
export const FRIENDS_ONLINE = 'FRIENDS_ONLINE'
export const FRIEND_ONLINE = 'FRIEND_ONLINE'
export const FRIEND_OFFLINE = 'FRIEND_OFFLINE'
export const SET_SOCKET = 'SET_SOCKET'
export const RECEIVED_MESSAGE = 'RECEIVED_MESSAGE'
export const SENDER_TYPING = 'SENDER_TYPING'
export const PAGINATE_MESSAGES = 'PAGINATE_MESSAGES'
export const INCREMENT_SCROLL = 'INCREMENT_SCROLL'
export const CREATE_CHAT = 'CREATE_CHAT'
export const ADD_USER_TO_GROUP = 'ADD_USER_TO_GROUP'
export const LEAVE_CURRENT_CHAT = 'LEAVE_CURRENT_CHAT'
export const DELETE_CURRENT_CHAT = 'DELETE_CURRENT_CHAT'

export const fetchChats = (data) => {
    data.forEach(chat => {
        chat.users.forEach(user => {
            user.status = 'offline'
        })
        chat.messages.reverse()
    })
    return {type: FETCH_CHATS, payload: data}
}

export const setCurrentChat = (chat) => {
    return {type: SET_CURRENT_CHAT, payload: chat}
}

export const onlineFriends = (friends) => {
    return {type: FRIENDS_ONLINE, payload: friends}
}

export const onlineFriend = (friend) => {
    return {type: FRIEND_ONLINE, payload: friend}
}

export const offlineFriend = (friend) => {
    return {type: FRIEND_OFFLINE, payload: friend}
}

export const setSocket = (socket) => {
    return {type: SET_SOCKET, payload: socket}
}

export const receivedMessage = (message, userId) => {
    return {type: RECEIVED_MESSAGE, payload: {message, userId}}
}

export const senderTyping = (sender) => {
    return {type: SENDER_TYPING, payload: sender}
}

export const paginateMessages = (id, messages, pagination) => {
    if (typeof messages !== 'undefined' && messages.length > 0) {
        messages.reverse()
        const payload = {messages, id, pagination}
        return {type: PAGINATE_MESSAGES, payload}
    }
}

export const incrementScroll = () => {
    return {type: INCREMENT_SCROLL}
}

export const createChat = (chat) => {
    return {type: CREATE_CHAT, payload: chat}
}

export const addUserToGroup = (group) => {
    return {type: ADD_USER_TO_GROUP, payload: group}
}

export const leaveCurrentChat = (data) => {
    return {type: LEAVE_CURRENT_CHAT, payload: data}
}

export const deleteCurrentChat = (chatId) => {
    return {type: DELETE_CURRENT_CHAT, payload: chatId}
}