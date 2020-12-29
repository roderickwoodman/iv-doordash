import React, { useState, useEffect } from 'react'

export const Chatroom = (props) => {

    const [chatrooms, setChatrooms] = useState([]);

    useEffect( () => {
        const getRoomList = () => {
            const hardcodedRoomList = [
                { id: 1, name: 'Analytics'},
                { id: 2, name: 'Business'},
                { id: 3, name: 'Design'},
                { id: 4, name: 'Engineering'},
                { id: 5, name: 'HR'},
                { id: 6, name: 'Operations'},
                { id: 7, name: 'Special Ops'},
            ];
            return hardcodedRoomList;
            // FIXME: do RoomList API here
        }
        setChatrooms(getRoomList());
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