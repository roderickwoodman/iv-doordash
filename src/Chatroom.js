import React, { useState, useEffect } from 'react'
import { roomsListApi, roomsDetailApi, messagesApi } from './Api.js'

export const Chatroom = (props) => {

    const [chatrooms, setChatrooms] = useState([]);
    const [messages, setMessages] = useState([]);

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
    }, [])

    return (
        <div className="chatroom">
            <section className="nav">
                { chatrooms.map( (chatroom,i) =>
                    <p key={i}>[#{chatroom.id}] {chatroom.name}: 
                        { chatroom.users.map( (user, j) => 
                        <span key={j}>{user}&nbsp;</span>
                        )}
                    </p>
                )}
            </section>
        </div>
    );
}

// FIXME: add PropTypes checking here