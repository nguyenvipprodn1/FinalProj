import React, {useState, Fragment, useEffect} from "react";
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
      if (e.target.value.length > 0){
          await agent.Account.searchUsers(e.target.value)
              .then((res)=>{
                  setSuggestions(res);
              })
      }

  };

  const addNewFriend = async (id) => {
   await agent.Chat.createChat(id)
       .then((res)=>{
           socket.invoke("AddFriend", { chats: res });
           setShowFriendsModal(false);
       })
  };

  return (
    <div id="friends" className="shadow-light">
      <div>
        <div id="title">
          <h3 className="text-xl font-bold">Friends</h3>
          <button onClick={() => setShowFriendsModal(true)} >ADD</button>
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
