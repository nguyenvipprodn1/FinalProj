import React from "react";
import ChatHeader from "../ChatHeader/ChatHeader";
import MessageBox from "../MessageBox/MessageBox";
import MessageInput from "../MessageInput/MessageInput";
import "./Messenger.scss";
import { useAppSelector } from "../../../../app/store/configureStore";

const Messenger = () => {
  const chat = useAppSelector((state) => state.chat.currentChat);
  const activeChat = () => {
    return Object.keys(chat).length > 0;
  };

  return (
    <div id="messenger" className="shadow-light">
      {activeChat() ? (
        <div id="messenger-wrap">
          <ChatHeader chat={chat} />
          <hr />
          <MessageBox chat={chat} />
          <MessageInput chat={chat} />
        </div>
      ) : (
        <p>No active chat</p>
      )}
    </div>
  );
};

export default Messenger;
