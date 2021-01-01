import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import doordashLogo from './img/logo-redonwhite.png'
import { roomsListApi, roomsDetailApi, messagesApi, newMessageApi } from './Api.js'


const RoomNav = (props) => {
    return (
        <nav aria-labelledby="sections-heading" id="room-nav">
            <div id="logo">
                <img src={doordashLogo} alt="DoorDash logo" />
            </div>
            <div id="me">
                <p className="name">{props.username}</p>
                <p className="session">{props.session}</p>
            </div>
            <h2 className="hide-element" id="sections-heading">Rooms</h2>
            <ul id="room-list">
                { props.allRooms.map( (room,i) =>
                    <li 
                        key={i} 
                        data-roomid={room.id}
                        className={(room.id === props.activeRoomId) ? 'clickable active' : 'clickable'}
                        onClick={props.onRoomClick}
                            >{room.name}</li>
                )}
            </ul>
        </nav>
    )
}

RoomNav.propTypes = {
    username: PropTypes.string.isRequired,
    session: PropTypes.string.isRequired,
    allRooms: PropTypes.array.isRequired,
    activeRoomId: PropTypes.number.isRequired,
    onRoomClick: PropTypes.func.isRequired,
}


const RoomHeader = (props) => {
    const sortedUsers = props.users.sort( (A,B) => {
        const a = A.toLowerCase();
        const b = B.toLowerCase();
        if (a === props.username.toLowerCase()) {
            return -1;
        } else if (b === props.username.toLowerCase()) {
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
        <header id="room-header">
            <h2 id="name">{props.roomName}</h2>
            <p>
                {sortedUsers.map( (user,i) =>
                    <span key={i}>
                        <span className={(user === props.username) ? 'active' : null}>{user}</span>
                        <span>{(i !== props.users.length - 1) ? ', ' : ' '}</span>
                    </span>
                )}
            </p>
        </header>
    )
}

RoomHeader.propTypes = {
    username: PropTypes.string.isRequired,
    roomName: PropTypes.string.isRequired,
    users: PropTypes.array.isRequired,
}


const RoomContent = (props) => {
    return (
        <section id="room-content">
            <ul id="message-list">
                {props.messages.map( (message,i) =>
                    <li key={i} className={(message.name === props.username) ? 'mine' : null}>
                        <div>
                            <div className="message">{message.message}</div>
                            { message.name !== props.username && 
                            <div className="name">{message.name}</div>
                            }
                        </div>
                    </li>
                )}
            </ul>
        </section>
    )
}

RoomContent.propTypes = {
    username: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
}


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
        <footer>
            <form id="room-content-input" onSubmit={handleSubmit}>
                <label className="hide-element" htmlFor="message">New message:</label>
                <input id="message" type="input" placeholder="Type a message..." value={message} onChange={handleChange} />
                <button id="send-button" type="submit">Send</button>
                <button id="logout-button" onClick={props.onLogout}>logout</button>
            </form>
        </footer>
    )
}

RoomContentInput.propTypes = {
    onSubmitMessage: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
}


const Loading = (props) => {

    const [dots, setDots] = useState('...');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect( () => {

        // Begin timing the current session
        const intervalId = setInterval( () => {
            const now = new Date().getTime();
            const deltaSecs = Math.floor((now - parseInt(props.user.sessionStart)) / (1000));
            if (deltaSecs < 30) {
                setDots('...' + '.'.repeat(deltaSecs));
            } else if (deltaSecs === 30) {
                setDots('...' + '.'.repeat(30) + 'x');
            }
            if (deltaSecs === 10) {
                setErrorMessage('STATUS: Still working. Please be patient.');
            } else if (deltaSecs === 20) {
                setErrorMessage('STATUS: Unexpected delay. Continue to hold a bit more.');
            } else if (deltaSecs === 30) {
                setErrorMessage('STATUS: ERROR. Aborting. Please log in again.');
                localStorage.clear();
            } else if (deltaSecs > 45) {
                props.onLogout();
            }
        }, 1000);

        return () => clearInterval(intervalId);

    }, [props, props.user.sessionStart, props.onLogout]);

    return (
        <div id="chatroom">
            <section id="room-nav"></section>
            <section id="room-header"></section>
            <section id="room-content">
                <div className="status">Welcome, {props.user.name}!</div>
                <div className="status">Initializing chatroom{dots}</div>
                <div className="status error">{errorMessage}</div>
                <button id="logout-button" onClick={props.onLogout}>cancel</button>
            </section>
        </div>
    )
}

Loading.propTypes = {
    user: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
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

            // Clear the mailbox
            props.onClearMailbox();

        }

        initRoomInfo()
        .then(setLoading(false));

        return () => clearInterval(intervalId);

    }, [props, props.user.sessionStart]);

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

            // Force the chat window to the bottom
            scrollToBottom();

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
                    username={props.user.name} 
                    session={session} 
                    allRooms={chatrooms} 
                    activeRoomId={activeChatroomId}
                    onRoomClick={onRoomClick}
                    />
                <RoomHeader 
                    username={props.user.name} 
                    roomName={activeRoom.name} 
                    users={activeRoom.users} 
                    />
                <RoomContent
                    username={props.user.name} 
                    messages={messages[activeChatroomId]}
                    />
                <RoomContentInput
                    onSubmitMessage={onSubmitMessage}
                    onLogout={props.onLogout}
                    />
            </div>
        )

    } else {

        return (
            <Loading user={props.user} onLogout={props.onLogout} />
        )

    }
}

Chatroom.propTypes = {
    user: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
    mailboxIsFull: PropTypes.bool.isRequired,
    onClearMailbox: PropTypes.func.isRequired,
}