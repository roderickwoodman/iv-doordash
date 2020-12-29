import React, { useState, useEffect } from 'react'
import { roomsListApi, roomsDetailApi, messagesApi } from './Api.js'

// PROPS: user, rooms, activeRoom
const RoomNav = (props) => {
    return (
        <section id="room-nav">
            <div id="me">
                <p>{props.user}</p>
            </div>
            <ul id="room-list">
                { props.rooms.map( (room,i) =>
                    <li key={i}>{room.name}</li>
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
                    <span key={i}>{user}#&nbsp;</span>
                )}
            </p>
        </section>
    )
}

// PROPS: user, messages
const RoomContent = (props) => {
    return (
        <section id="room-content">
            <ul>
                {props.messages.map( (message,i) =>
                    <li key={i}>[{message.name}] {message.message}</li>
                )}
            </ul>
        </section>
    )
}

// PROPS: onSubmitMessage
const RoomContentInput = (props) => {
    return (
        <section id="room-content-input">
            <input placeholder="Type a message..." />
            <button>Send</button>
        </section>
    )
}

export const Chatroom = (props) => {

    const [loading, setLoading] = useState(true);
    const [chatrooms, setChatrooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChatroomId, setActiveChatroomId] = useState(0);

    // Initialize the room info from API data
    useEffect( () => {

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

    const onSubmitMessage = (messageContent) => {
        // FIXME: do POST API call here
    }

    if (!loading 
        && chatrooms.length 
        && Object.keys(messages).length) {

        const roomNames = chatrooms.map( room => room.name );
        const activeRoom = chatrooms.filter( room => room.id === activeChatroomId )[0];

        return (
            <div className="chatroom">
                <RoomNav 
                    user={props.username} 
                    rooms={roomNames} 
                    activeRoom={activeChatroomId}
                    />
                <RoomHeader 
                    user={props.username} 
                    name={activeRoom.name} 
                    users={activeRoom.users} 
                    />
                <RoomContent
                    user={props.username} 
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