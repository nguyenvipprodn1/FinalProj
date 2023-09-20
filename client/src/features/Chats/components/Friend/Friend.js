import React from 'react'
import { useSelector } from 'react-redux'
import { userStatus } from '../../../../Utility/chatHelper'
import './Friend.scss'

const Friend = ({ chat, click }) => {

    const currentChat = useSelector(state => state.chatReducer.currentChat)

    const isChatOpened = () => {
        return currentChat.id === chat.id ? 'opened' : ''
    }

    const lastMessage = () => {
        if (chat.messages.length === 0) return ''

        const message = chat.messages[chat.messages.length - 1]
        return message.type === 'image' ? 'image uploaded' : message.message
    }

    return (
        <div onClick={click} className={`friend-list ${isChatOpened()}`}>
            <div>
                <img width='40' height='40' src="https://phunugioi.com/wp-content/uploads/2020/01/anh-avatar-supreme-dep-lam-dai-dien-facebook.jpg" alt='User avatar' />
                <div className='friend-info'>
                    <h4 className='m-0 font-bold'>{chat.users[0].firstName} {chat.users[0].lastName}</h4>
                    <h5 className='m-0'>{lastMessage()}</h5>
                </div>
            </div>
            <div className='friend-status'>
                <span className={`online-status ${userStatus(chat.users[0])}`}></span>
            </div>
        </div>
    )
}

export default Friend