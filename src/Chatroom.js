import React, { useState, useEffect } from 'react'
import { roomsListApi, roomsDetailApi, messagesApi, newMessageApi } from './Api.js'

// PROPS: user, session, allRooms, activeRoomId
const RoomNav = (props) => {
    return (
        <section id="room-nav">
            <div id="me">
                <p>{props.user}</p>
                <p>{props.session}</p>
            </div>
            <ul id="room-list">
                { props.allRooms.map( (room,i) =>
                    <li 
                        key={i} 
                        data-roomid={room.id}
                        className={(room.id === props.activeRoomId) ? 'active' : null}
                        onClick={props.onRoomClick}
                            >{room.name}</li>
                )}
            </ul>
        </section>
    )
}

// PROPS: user, name, users
const RoomHeader = (props) => {
    return (
        <section id="room-header">
            <h2>{props.name}</h2>
            <p>
                {props.users.map( (user,i) =>
                    <span key={i}>
                        <span className={(user === props.user) ? 'active' : null}>{user}</span>
                        <span>{(i !== props.users.length - 1) ? ', ' : ' '}</span>
                    </span>
                )}
            </p>
        </section>
    )
}

// PROPS: user, messages
const RoomContent = (props) => {
    return (
        <section id="room-content">
            <ul id="message-list">
                {props.messages.map( (message,i) =>
                    <li key={i} className={(message.name === props.user) ? 'mine' : null}>
                        <div className="message">{message.message}</div>
                        { message.name !== props.user && 
                        <div className="name">{message.name}</div>
                        }
                    </li>
                )}
            </ul>
        </section>
    )
}

// PROPS: onSubmitMessage
const RoomContentInput = (props) => {

    const [message, setMessage] = useState('');

    const handleChange = (event) => {
        setMessage(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setMessage('');
        props.onSubmitMessage(message);
    }

    return (
        <form id="room-content-input" onSubmit={handleSubmit}>
            <input placeholder="Type a message..." value={message} onChange={handleChange} />
            <button type="submit">Send</button>
        </form>
    )
}

export const Chatroom = (props) => {

    const [session, setSession] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatrooms, setChatrooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChatroomId, setActiveChatroomId] = useState(0);

    // Initialize the room info from API data
    useEffect( () => {

        // const intervalId = window.setInterval();
        // const update

        const initRoomInfo = async () => {

            // 1. Collect room IDs
            const roomListResponse = await roomsListApi();

            // 2A. For each room, collect room name and users info
            const roomDetailResponses = await Promise.all(
                roomListResponse.map( function(room) {
                    return roomsDetailApi(room.id);
                })
            )

            // Save the room ID, room name, and users info in state
            setChatrooms(roomDetailResponses);

            // 2B. For each room, collect messages info
            const messagesResponses = await Promise.all(
                roomListResponse.map( function(room) {
                    return messagesApi(room.id);
                })
            )

            // Save the messages in state, after reattaching room ID from the request
            let allMessages = {};
            messagesResponses.forEach( (resp, idx) => {
                let roomId = roomListResponse[idx].id;
                allMessages[roomId] = JSON.parse(JSON.stringify(resp))
            })
            setMessages(allMessages);

        }
        initRoomInfo()
        .then(setLoading(false));
    }, [])

    const onSubmitMessage = async (message) => {

        // Submit the new messsage
        const newMessageResponse = await newMessageApi(activeChatroomId, props.user.name, message);

        // Update the display with current versions of the affected API data
        if (Object.keys(newMessageResponse).length) {

            // Fetch an up-to-date collection of messages for this chatroom
            let updatedAllMessages = JSON.parse(JSON.stringify(messages)); 
            let updatedRoomMessages = await messagesApi(activeChatroomId);
            updatedAllMessages[activeChatroomId] = updatedRoomMessages;
            setMessages(updatedAllMessages);

            // Fetch an up-to-date collection of users for this chatroom
            let updatedAllChatrooms = JSON.parse(JSON.stringify(chatrooms)); 
            let updatedRoomInfo = await roomsDetailApi(activeChatroomId);
            updatedAllChatrooms.map( (roomInfo, idx) => {
                if (roomInfo.id === activeChatroomId) {
                    return updatedAllChatrooms[idx] = updatedRoomInfo;
                } else {
                    return roomInfo;
                }
            })
            setChatrooms(updatedAllChatrooms);

        }
    }

    const onRoomClick = (event) => {
        setActiveChatroomId(parseInt(event.target.getAttribute('data-roomid')));
    }

    if (!loading 
        && chatrooms.length 
        && Object.keys(messages).length) {

        const activeRoom = chatrooms.filter( room => room.id === activeChatroomId )[0];

        return (
            <div id="chatroom">
                <RoomNav 
                    user={props.user.name} 
                    session={session} 
                    allRooms={chatrooms} 
                    activeRoomId={activeChatroomId}
                    onRoomClick={onRoomClick}
                    />
                <RoomHeader 
                    user={props.user.name} 
                    name={activeRoom.name} 
                    users={activeRoom.users} 
                    />
                <RoomContent
                    user={props.user.name} 
                    messages={messages[activeChatroomId]}
                    />
                <RoomContentInput
                    onSubmitMessage={onSubmitMessage}
                    />
            </div>
        )

    } else {

        return (
            <div>Loading...</div>
        )

    }
}

// FIXME: add PropTypes checking here