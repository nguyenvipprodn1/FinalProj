import React, { Fragment, useState } from 'react'
import { userStatus } from '../../../../Utility/chatHelper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {connect, useDispatch, useSelector} from 'react-redux'
import Modal from '../Modal/Modal'
import {
    searchUsers,
    addFriendToGroupChat,
    leaveCurrentChat,
    deleteCurrentChat,
    refreshToken, tokenRequestInterceptor
} from '../../../../apiServices/index'
import './ChatHeader.scss'
import {getNewTokenSuccess, logoutSuccess} from "../../../../store/actions/authenticateAction";
const ChatHeader = ({ chat,jwtToken }) => {

    const [showChatOptions, setShowChatOptions] = useState(false)
    const [showAddFriendModal, setShowAddFriendModal] = useState(false)
    const [suggestions, setSuggestions] = useState([])

    const socket = useSelector(state => state.chatReducer.socket);

    let jwtTokenState = jwtToken;
    const dispatch = useDispatch();
    const searchFriends = async (e) => {
        const search = async () => {
            const {data, status} = await searchUsers(e.target.value, jwtTokenState);
            return {data, status};
        };
        const getRefreshToken = async () => {
            const {data, status} = await refreshToken(jwtTokenState);
            if (status === 200) {
                jwtTokenState = data.jwtToken;
                dispatch(getNewTokenSuccess(data));
            } else {
                dispatch(logoutSuccess());
            }
        };

        const {status, data} = await tokenRequestInterceptor(
            search,
            getRefreshToken
        );
        if (status === 200) {
            setSuggestions(data)
        }
    }

    const addNewFriend = async (id) => {
        const add = async () => {
            const {data, status} = await addFriendToGroupChat(id, chat.id, jwtTokenState);
            return {data, status};
        };
        const getRefreshToken = async () => {
            const {data, status} = await refreshToken(jwtTokenState);
            if (status === 200) {
                jwtTokenState = data.jwtToken;
                dispatch(getNewTokenSuccess(data));
            } else {
                dispatch(logoutSuccess());
            }
        };

        const {status, data} = await tokenRequestInterceptor(
            add,
            getRefreshToken
        );
        if (status === 200) {
            socket.invoke('AddUserToGroup', data)
            setShowAddFriendModal(false)
        }
    }

    const leaveChat = async () => {
        const leave = async () => {
            const {data, status} = await leaveCurrentChat(chat.id, jwtTokenState);
            return {data, status};
        };
        const getRefreshToken = async () => {
            const {data, status} = await refreshToken(jwtTokenState);
            if (status === 200) {
                jwtTokenState = data.jwtToken;
                dispatch(getNewTokenSuccess(data));
            } else {
                dispatch(logoutSuccess());
            }
        };

        const {status, data} = await tokenRequestInterceptor(
            leave,
            getRefreshToken
        );
        if (status === 200) {
            socket.invoke('LeaveCurrentChat', data)
        }
    }

    const deleteChat =async () => {
        const deleteApi = async () => {
            const {data, status} = await deleteCurrentChat(chat.id, jwtTokenState);
            return {data, status};
        };
        const getRefreshToken = async () => {
            const {data, status} = await refreshToken(jwtTokenState);
            if (status === 200) {
                jwtTokenState = data.jwtToken;
                dispatch(getNewTokenSuccess(data));
            } else {
                dispatch(logoutSuccess());
            }
        };

        const {status, data} = await tokenRequestInterceptor(
            deleteApi,
            getRefreshToken
        );
        if (status === 200) {
            socket.invoke('DeleteChat', data)
        }
    }

    return (
        <Fragment>
            <div id='chatter'>
                {
                    chat.users.map(user => {
                        return <div className='chatter-info' key={user.id}>
                            <h3 className='font-bold'>{user.firstName} {user.lastName}</h3>
                            <div className='chatter-status'>
                                <span className={`online-status ${userStatus(user)}`}></span>
                            </div>
                        </div>
                    })
                }
            </div>
            <FontAwesomeIcon
                onClick={() => setShowChatOptions(!showChatOptions)}
                icon={['fas', 'ellipsis-v']}
                className='fa-icon'
            />
            {
                showChatOptions
                    ? <div id='settings'>
                        <div onClick={() => setShowAddFriendModal(true)}>
                            <FontAwesomeIcon
                                icon={['fas', 'user-plus']}
                                className='fa-icon'
                            />
                            <p>Add user to chat</p>
                        </div>

                        {
                            chat.type === 'group'
                                ? <div onClick={() => leaveChat()}>
                                    <FontAwesomeIcon
                                        icon={['fas', 'sign-out-alt']}
                                        className='fa-icon'
                                    />
                                    <p>Leave chat</p>
                                </div>
                                : null
                        }

                        {
                            chat.type === 'dual' ?
                                <div onClick={() => deleteChat()}>
                                    <FontAwesomeIcon
                                        icon={['fas', 'trash']}
                                        className='fa-icon'
                                    />
                                    <p>Delete chat</p>
                                </div>
                                : null
                        }
                    </div>
                    : null
            }
            {
                showAddFriendModal &&
                <Modal click={() => setShowAddFriendModal(false)}>
                    <Fragment key='header'>
                        <h3 className='m-0'>Add friend to group chat</h3>
                    </Fragment>

                    <Fragment key='body'>
                        <p>Find friends by typing their name bellow</p>
                        <input
                            onInput={e => searchFriends(e)}
                            type='text'
                            placeholder='Search...'
                        />
                        <div id='suggestions'>
                            {
                                suggestions.map(user => {
                                    return <div key={user.id} className='suggestion'>
                                        <p className='m-0'>{user.firstName} {user.lastName}</p>
                                        <button onClick={() => addNewFriend(user.id)}>ADD</button>
                                    </div>
                                })
                            }
                        </div>
                    </Fragment>
                </Modal>
            }
        </Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        jwtToken: state.authenticateReducer.jwtToken,
    };
};

export default connect(mapStateToProps, null)(ChatHeader);