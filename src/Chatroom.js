import React, { useState, useEffect } from 'react'
import { roomsListApi, roomsDetailApi } from './Api.js'

export const Chatroom = (props) => {

    const [chatrooms, setChatrooms] = useState([]);

    // Initialize the room info from API data
    useEffect( () => {

        const initRoomInfo = async () => {

            // Collect room ID and room name info
            const roomListResponse = await roomsListApi();

            // Collect room ID, room name, and users info
            const roomDetailResponses = await Promise.all(
                roomListResponse.map( function(room) {
                    return roomsDetailApi(room.id);
                })
            )

            // Save the room ID, room name, and users info in state
            setChatrooms(roomDetailResponses);

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