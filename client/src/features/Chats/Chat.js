import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FriendList from "./components/FriendList/FriendList";
import Messenger from "./components/Messenger/Messenger";
import "./Chat.scss";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  fetchChats,
  onlineFriends,
  onlineFriend,
  offlineFriend,
  setSocket,
  receivedMessage,
  senderTyping,
  createChat,
  addUserToGroup,
  leaveCurrentChat,
  deleteCurrentChat,
} from "./reducers/chatSlice";
import agent from "../../app/api/agent";
import { useAppSelector, useAppDispatch } from "../../app/store/configureStore";

const Chat = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.account.user);
  const chats = useAppSelector((state) => state.chat.chats);

  useEffect(() => {
    if (chats) {
      const connection = new HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_SOCKET_URL}/chat`)
        .build();

      connection
        .start()
        .then(() => {
          dispatch(setSocket(connection));
          connection.invoke("Join", user);

          connection.on("typing", (sender) => {
            console.log("typing");
            dispatch(senderTyping(sender));
          });

          connection.on("friends", (friends) => {
            console.log("Friends", friends);
            dispatch(onlineFriends(friends));
          });

          connection.on("online", (onlineUser) => {
            dispatch(onlineFriend(onlineUser));
            console.log("Online", onlineUser);
          });

          connection.on("offline", (offlineUser) => {
            dispatch(offlineFriend(offlineUser));
            console.log("Offline", offlineUser);
          });

          connection.on("received", (message) => {
            console.log("received", message);
            let payload = {
              message,
              userId: user.id,
            };
            dispatch(receivedMessage(payload));
          });

          connection.on("new-chat", (chat) => {
            dispatch(createChat(chat));
          });

          connection.on("added-user-to-group", (group) => {
            dispatch(addUserToGroup(group));
          });

          connection.on("remove-user-from-chat", (data) => {
            data.currentUserId = user.id;
            dispatch(leaveCurrentChat(data));
          });

          connection.on("delete-chat", (chatId) => {
            dispatch(deleteCurrentChat(chatId));
          });
        })
        .catch((err) => console.log(err));

      return () => {
        connection.stop();
      };
    }
  }, []);

  useEffect(() => {
    (async () => {
      const chatData = await getChats();
      dispatch(fetchChats(chatData));
    })();
  }, [dispatch, user]);

  const getChats = async () => {
    try {
      const res = await agent.Chat.fetchChats();
      return res;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return (
    <div id="chat-container">
      <div id="chat-wrap">
        <FriendList />
        <Messenger />
      </div>
    </div>
  );
};

export default Chat;
