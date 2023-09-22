import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Message from "../Message/Message";
import { paginateMessages } from "../../reducers/chatSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./MessageBox.scss";
import agent from "../../../../app/api/agent";
import { useAppSelector } from "../../../../app/store/configureStore";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

const MessageBox = ({ chat }) => {
  const dispatch = useDispatch();

  const user = useAppSelector((state) => state.account.user);
  const scrollBottom = useAppSelector((state) => state.chat.scrollBottom);
  const senderTyping = useAppSelector((state) => state.chat.senderTyping);
  const [loading, setLoading] = useState(false);
  const [scrollUp, setScrollUp] = useState(0);

  const msgBox = useRef();

  const scrollManual = (value) => {
    msgBox.current.scrollTop = value;
  };

  const handleInfiniteScroll = async (e) => {
    if (e.target.scrollTop === 0) {
      setLoading(true);
      const pagination = chat.Pagination;
      const page = typeof pagination === "undefined" ? 1 : pagination.page;

      await agent.Chat.paginateMessages(
        chat.id,
        parseInt(page) + 1
      ).then((res)=>{
        const { messages, pagination } = res;
        if (typeof messages !== "undefined" && messages.length > 0) {
          let payload = {
            id: chat.id,
            messages,
            pagination
          }
          dispatch(paginateMessages(payload));
          setScrollUp(scrollUp + 1);
        }

        setLoading(false);
      })
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollManual(Math.ceil(msgBox.current.scrollHeight * 0.1));
    }, 100);
  }, [scrollUp]);

  useEffect(() => {
    if (
      senderTyping.typing &&
      msgBox.current.scrollTop > msgBox.current.scrollHeight * 0.3
    ) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [senderTyping]);

  useEffect(() => {
    if (!senderTyping.typing) {
      setTimeout(() => {
        scrollManual(msgBox.current.scrollHeight);
      }, 100);
    }
  }, [scrollBottom]);

  return (
    <div onScroll={handleInfiniteScroll} id="msg-box" ref={msgBox}>
      {loading ? (
        <p className="loader m-0">
          <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
        </p>
      ) : null}
      {chat.messages != null && chat.messages.map((message, index) => {
        return (
          <Message
            user={user}
            chat={chat}
            message={message}
            index={index}
            key={message.id}
          />
        );
      })}
      {senderTyping.typing && senderTyping.chatId === chat.id ? (
        <div className="message mt-5p">
          <div className="other-person">
            <p className="m-0">...</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessageBox;
