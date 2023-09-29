import React from "react";
import { userStatus } from "../../utility/chatHelper";
import "./Friend.scss";
import { useAppSelector } from "../../../../app/store/configureStore";
const Friend = ({ chat, click, ...props }) => {
  const currentChat = useAppSelector((state) => state.chat.currentChat);

  const isChatOpened = () => {
    return currentChat.id === chat.id ? "opened" : "";
  };

  const lastMessage = () => {
    if (chat.messages === null || chat.messages.length === 0) return "";

    const message = chat.messages[chat.messages.length - 1];
    return message.type === "image" ? "image uploaded" : message.message;
  };

  return (
    <div onClick={click} className={`friend-list ${isChatOpened()}`} {...props}>
      <div>
        <img
          width="40"
          height="40"
          src="https://bsnl.ch/wp-content/uploads/2019/03/avatar-default-circle.png"
          alt="User avatar"
        />
        <div className="friend-info">
          <h4 className="m-0 font-bold">
            {chat.users[0].firstName} {chat.users[0].lastName}
          </h4>
          <h5 className="m-0">{lastMessage()}</h5>
        </div>
      </div>
      <div className="friend-status">
        <span className={`online-status ${userStatus(chat.users[0])}`}></span>
      </div>
    </div>
  );
};

export default Friend;
