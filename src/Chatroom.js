import React, { useState, useEffect } from 'react'
import { roomsListApi } from './Api.js'

export const Chatroom = (props) => {

    const [chatrooms, setChatrooms] = useState([]);

    useEffect( () => {
        const getRoomList = async () => {
            let response = await roomsListApi();
            setChatrooms(response);
        }
        getRoomList()
    }, [])

    return (
        <div className="chatroom">
            <section className="nav">
                { chatrooms.map( (chatroom,i) =>
                    <p key={i}>[#{chatroom.id}] {chatroom.name}</p>
                )}
            </section>
        </div>
    );
}

// FIXME: add PropTypes checking here