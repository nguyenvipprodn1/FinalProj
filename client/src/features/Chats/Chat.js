import React, {useEffect} from 'react'
import {useSelector, useDispatch, connect} from 'react-redux'
import FriendList from './components/FriendList/FriendList'
import Messenger from './components/Messenger/Messenger'
import './Chat.scss'
import {HubConnectionBuilder} from '@microsoft/signalr';
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
} from '../../store/actions/chatActions';
import {refreshToken, tokenRequestInterceptor,fetchChats as apiFetchChat} from "../../apiServices";
import {getNewTokenSuccess, logoutSuccess} from "../../store/actions/authenticateAction";

const Chat = ({jwtToken}) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.authenticateReducer)

    let jwtTokenState = jwtToken;

    useEffect(() => {
        (async () => await getChats())()

        const connection = new HubConnectionBuilder()
            .withUrl(`${process.env.REACT_APP_BASE_API}/chat`)
            .build();

        connection.start()
            .then(() => {
                dispatch(setSocket(connection));
                connection.invoke('Join', user);

                connection.on('typing', (sender) => {
                    console.log('typing')
                    dispatch(senderTyping(sender));
                });

                connection.on('friends', (friends) => {
                    console.log('Friends', friends);
                    dispatch(onlineFriends(friends));
                });

                connection.on('online', (onlineUser) => {
                    dispatch(onlineFriend(onlineUser));
                    console.log('Online', onlineUser);
                });

                connection.on('offline', (offlineUser) => {
                    dispatch(offlineFriend(offlineUser));
                    console.log('Offline', offlineUser);
                });

                connection.on('received', (message) => {
                    dispatch(receivedMessage(message, user.id));
                });

                connection.on('new-chat', (chat) => {
                    dispatch(createChat(chat));
                });

                connection.on('added-user-to-group', (group) => {
                    dispatch(addUserToGroup(group));
                });

                connection.on('remove-user-from-chat', (data) => {
                    data.currentUserId = user.id;
                    dispatch(leaveCurrentChat(data));
                });

                connection.on('delete-chat', (chatId) => {
                    dispatch(deleteCurrentChat(chatId));
                });
            })
            .catch((err) => console.log(err))

        return ()=> {
            connection.stop();
        }

    }, [dispatch, user]);

    const getChats = async () => {
        const get = async () => {
            const {data, status} = await apiFetchChat(jwtTokenState);
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
            get,
            getRefreshToken
        );
        if (status === 200) {
            dispatch(fetchChats(data))
        }
    }

    return (
        <div id='chat-container'>
            <div id='chat-wrap'>
                <FriendList/>
                <Messenger/>
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        jwtToken: state.authenticateReducer.jwtToken,
    };
};
export default connect(mapStateToProps, null)(Chat);