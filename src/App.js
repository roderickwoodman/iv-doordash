import React, { useState } from 'react'
import './App.css';
import { Chatroom } from './Chatroom'

export const App = () => {

    const [usernameInput, setUsernameInput] = useState('');
    const [username, setUsername] = useState(null);

    const handleChange = (event) => {
        event.preventDefault();
        setUsernameInput(event.target.value);
    }

    const handleSubmit = (event) => {
        setUsername(usernameInput);
    }

    if (username === null) {
        return (
            <div className="App">
                <input size="30" value={usernameInput} onChange={handleChange} placeholder="Type your username..." required />
                <button onClick={handleSubmit}>Join the DoorDash Chat!</button>
            </div>
        );
    } else {
        return (
            <Chatroom username={username} />
        );
    }
}