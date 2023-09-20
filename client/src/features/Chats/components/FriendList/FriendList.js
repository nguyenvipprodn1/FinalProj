import React, { useState, Fragment } from 'react'
import {useSelector, useDispatch, connect} from 'react-redux'
import Friend from '../Friend/Friend'
import { setCurrentChat } from '../../../../store/actions/chatActions'
import Modal from '../Modal/Modal'
import {searchUsers,createChat,refreshToken,tokenRequestInterceptor} from "../../../../apiServices";
import {getNewTokenSuccess, logoutSuccess} from "../../../../store/actions/authenticateAction";
import './FriendList.scss'

const FriendList = ({jwtToken}) => {

    const dispatch = useDispatch()
    const chats = useSelector(state => state.chatReducer.chats)
    const socket = useSelector(state => state.chatReducer.socket)

    const [showFriendsModal, setShowFriendsModal] = useState(false)
    const [suggestions, setSuggestions] = useState([])

    let jwtTokenState = jwtToken;

    const openChat = (chat) => {
        dispatch(setCurrentChat(chat))
    }

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
        const create = async () => {
            const {data, status} = await createChat(id, jwtTokenState);
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
            create,
            getRefreshToken
        );

        if (status === 200) {
            console.log("add")
            console.log({chats : data})
            socket.invoke('AddFriend', {chats : data})
            setShowFriendsModal(false)
        }
    }

    return (
        <div id='friends' className='shadow-light'>
            <div className="mb-2">
                <div id='title'>
                    <h3 className='m-0 text-xl font-bold'>Friends</h3>
                    <button onClick={() => setShowFriendsModal(true)}>ADD</button>
                </div>
            </div>


            <hr />

            <div id='friends-box'>
                {
                    chats.length > 0
                        ? chats.map(chat => {
                            return <Friend click={() => openChat(chat)} chat={chat} key={chat.id} />
                        })
                        : <p id='no-chat'>No friends added</p>
                }
            </div>
            {
                showFriendsModal &&
                <Modal click={() => setShowFriendsModal(false)}>
                    <Fragment key='header'>
                        <h3 className='m-0'>Create new chat</h3>
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
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        jwtToken: state.authenticateReducer.jwtToken,
    };
};

export default connect(mapStateToProps, null)(FriendList);