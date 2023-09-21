import React, { Fragment, useState } from "react";
import { userStatus } from "../../utility/chatHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "../Modal/Modal";
import agent from "../../../../app/api/agent";
import "./ChatHeader.scss";
import { useAppSelector } from "../../../../app/store/configureStore";
import {faEllipsisVertical, faPlus, faRightFromBracket, faTrash} from "@fortawesome/free-solid-svg-icons";

const ChatHeader = ({ chat }) => {
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const socket = useAppSelector((state) => state.chat.socket);

  const searchFriends = async (e) => {
    const { data, status } = await agent.Chat.searchUsers(e.target.value);

    if (status === 200) {
      setSuggestions(data);
    }
  };

  const addNewFriend = async (id) => {
    const { data, status } = await agent.Chat.addFriendToGroupChat(id, chat.id);

    if (status === 200) {
      socket.invoke("AddUserToGroup", data);
      setShowAddFriendModal(false);
    }
  };

  const leaveChat = async () => {
    const { data, status } = await agent.ChatleaveCurrentChat(chat.id);

    if (status === 200) {
      socket.invoke("LeaveCurrentChat", data);
    }
  };

  const deleteChat = async () => {
    const { data, status } = await agent.ChatdeleteCurrentChat(chat.id);

    if (status === 200) {
      socket.invoke("DeleteChat", data);
    }
  };

  return (
    <Fragment>
      <div id="chatter">
        {chat.users.map((user) => {
          return (
            <div className="chatter-info" key={user.id}>
              <h3 className="font-bold">
                {user.firstName} {user.lastName}
              </h3>
              <div className="chatter-status">
                <span className={`online-status ${userStatus(user)}`}></span>
              </div>
            </div>
          );
        })}
      </div>
      <FontAwesomeIcon
        onClick={() => setShowChatOptions(!showChatOptions)}
        icon={faEllipsisVertical}
        className="fa-icon"
      />
      {showChatOptions ? (
        <div id="settings">
          <div onClick={() => setShowAddFriendModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="fa-icon" />
            <p>Add user to chat</p>
          </div>

          {chat.type === "group" ? (
            <div onClick={() => leaveChat()}>
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="fa-icon"
              />
              <p>Leave chat</p>
            </div>
          ) : null}

          {chat.type === "dual" ? (
            <div onClick={() => deleteChat()}>
              <FontAwesomeIcon icon={faTrash} className="fa-icon" />
              <p>Delete chat</p>
            </div>
          ) : null}
        </div>
      ) : null}
      {showAddFriendModal && (
        <Modal click={() => setShowAddFriendModal(false)}>
          <Fragment key="header">
            <h3 className="m-0">Add friend to group chat</h3>
          </Fragment>

          <Fragment key="body">
            <p>Find friends by typing their name bellow</p>
            <input
              onInput={(e) => searchFriends(e)}
              type="text"
              placeholder="Search..."
            />
            <div id="suggestions">
              {suggestions.map((user) => {
                return (
                  <div key={user.id} className="suggestion">
                    <p className="m-0">
                      {user.firstName} {user.lastName}
                    </p>
                    <button onClick={() => addNewFriend(user.id)}>ADD</button>
                  </div>
                );
              })}
            </div>
          </Fragment>
        </Modal>
      )}
    </Fragment>
  );
};

export default ChatHeader;
