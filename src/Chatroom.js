import React, { useState, useEffect } from 'react'
import { roomsListApi, roomsDetailApi, messagesApi, newMessageApi } from './Api.js'

// PROPS: user, session, allRooms, activeRoomId
const RoomNav = (props) => {
    return (
        <section id="room-nav">
            <div id="me">
                <p className="name">{props.user}</p>
                <p className="session">{props.session}</p>
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
    const sortedUsers = props.users.sort( (A,B) => {
        const a = A.toLowerCase();
        const b = B.toLowerCase();
        if (a === props.user.toLowerCase()) {
            return -1;
        } else if (b === props.user.toLowerCase()) {
            return 1;
        } else if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    })
    return (
        <section id="room-header">
            <h2>{props.name}</h2>
            <p>
                {sortedUsers.map( (user,i) =>
                    <span key={i}>
                        <span className={(user === props.user) ? 'active' : null}>{user}</span>
                        <span>{(i !== props.users.length - 1) ? ', ' : ' '}</span>
                    </span>
                )}
            </p>
            <button id="logout-button" onClick={props.onLogout}>logout</button>
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
                        <div>
                            <div className="message">{message.message}</div>
                            { message.name !== props.user && 
                            <div className="name">{message.name}</div>
                            }
                        </div>
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
            <button id="send-button" type="submit">Send</button>
        </form>
    )
}

const Loading = (props) => {

    const [dots, setDots] = useState('...');

    useEffect( () => {

        // Begin timing the current session
        const intervalId = setInterval( () => {
            const now = new Date().getTime();
            const deltaSecs = Math.floor((now - parseInt(props.sessionStart)) / (1000));
            setDots('...' + '.'.repeat(deltaSecs));
        }, 1000);

        return () => clearInterval(intervalId);

    }, [props.sessionStart]);

    return (
        <div id="chatroom">
            <section id="room-nav"></section>
            <section id="room-header"></section>
            <section id="room-content">
                <div className="status">Fetching chatroom data{dots}</div>
            </section>
        </div>
    )
}

export const Chatroom = (props) => {

    const [session, setSession] = useState('Online for < 1 minute');
    const [loading, setLoading] = useState(true);
    const [chatrooms, setChatrooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChatroomId, setActiveChatroomId] = useState(null);

    useEffect( () => {

        // Begin timing the current session
        const intervalId = setInterval( () => {
            const now = new Date().getTime();
            const deltaMins = Math.floor((now - parseInt(props.user.sessionStart)) / (1000 * 60));
            let duration = '< 1 minute';
            if (deltaMins === 1) {
                duration = '1 minute';
            } else if (deltaMins > 1) {
                duration = `${deltaMins} minutes`;
            }
            setSession(`Online for ${duration}`);
        }, 1000*10);

        // Initialize the room info from API data
        const initRoomInfo = async () => {

            // Collect room IDs
            const roomListResponse = await roomsListApi();

            // For each room, collect and save the room name and users info
            const roomDetailResponses = await Promise.all(
                roomListResponse.map( function(room) {
                    return roomsDetailApi(room.id);
                })
            )
            setChatrooms(roomDetailResponses);

            // For each room, collect and save the messages info
            const messagesResponses = await Promise.all(
                roomListResponse.map( function(room) {
                    return messagesApi(room.id);
                })
            )
            let allMessages = {};
            messagesResponses.forEach( (resp, idx) => {
                let roomId = roomListResponse[idx].id;
                allMessages[roomId] = JSON.parse(JSON.stringify(resp))
            })
            setMessages(allMessages);

            // Init the active chatroom
            const storedActiveChatroomId = JSON.parse(localStorage.getItem('activeChatroomId'));
            if (storedActiveChatroomId !== null) {
                setActiveChatroomId(storedActiveChatroomId);
            } else if (roomListResponse.length) {
                const roomId = roomListResponse[0].id;
                localStorage.setItem('activeChatroomId', JSON.stringify(roomId));
                setActiveChatroomId(roomId);
            }

            // Force the chat window to the bottom
            scrollToBottom();

        }

        initRoomInfo()
        .then(setLoading(false));

        return () => clearInterval(intervalId);

    }, [props.user.sessionStart]);

    const scrollToBottom = () => {

        const chatElement = document.getElementById('room-content');
        chatElement.scrollTop = chatElement.scrollHeight;

    }

    const onSubmitMessage = async (message) => {

        // Submit the new messsage
        const newMessageResponse = await newMessageApi(activeChatroomId, props.user.name, message);

        // This new message requires the following data/display updates
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
        const newActiveChatroomId = parseInt(event.target.getAttribute('data-roomid'));
        localStorage.setItem('activeChatroomId', JSON.stringify(newActiveChatroomId));
        setActiveChatroomId(newActiveChatroomId);
    }

    if (!loading
        && chatrooms.length 
        && Object.keys(messages).length
        && activeChatroomId !== null) {

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
                    onLogout={props.onLogout}
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
            <Loading sessionStart={props.user.sessionStart} />
        )

    }
}

// FIXME: add PropTypes checking here