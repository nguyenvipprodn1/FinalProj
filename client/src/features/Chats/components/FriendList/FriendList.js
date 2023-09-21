import React, { useState, Fragment } from "react";
import { useDispatch } from "react-redux";
import Friend from "../Friend/Friend";
import { setCurrentChat } from "../../reducers/chatSlice";
import Modal from "../Modal/Modal";
import agent from "../../../../app/api/agent";
import "./FriendList.scss";
import { useAppSelector } from "../../../../app/store/configureStore";

const FriendList = () => {
  const dispatch = useDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const socket = useAppSelector((state) => state.chat.socket);

  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const openChat = (chat) => {
    dispatch(setCurrentChat(chat));
  };

  const searchFriends = async (e) => {
    const { data, status } = await agent.Chat.searchUsers(e.target.value);

    if (status === 200) {
      setSuggestions(data);
    }
  };

  const addNewFriend = async (id) => {
    const { data, status } = await agent.Chat.createChat(id);

    if (status === 200) {
      socket.invoke("AddFriend", { chats: data });
      setShowFriendsModal(false);
    }
  };

  return (
    <div id="friends" className="shadow-light">
      <div className="mb-2">
        <div id="title">
          <h3 className="m-0 text-xl font-bold">Friends</h3>
          <button onClick={() => setShowFriendsModal(true)}>ADD</button>
        </div>
      </div>

      <hr />

      <div id="friends-box">
        {chats.length > 0 ? (
          chats.map((chat) => {
            return (
              <Friend click={() => openChat(chat)} chat={chat} key={chat.id} />
            );
          })
        ) : (
          <p id="no-chat">No friends added</p>
        )}
      </div>
      {showFriendsModal && (
        <Modal click={() => setShowFriendsModal(false)}>
          <Fragment key="header">
            <h3 className="m-0">Create new chat</h3>
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
    </div>
  );
};

export default FriendList;
