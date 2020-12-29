import React, { useState } from 'react'
import './App.css';
import { Chatroom } from './Chatroom'

const Login = (props) => {

    const [usernameInput, setUsernameInput] = useState('');

    const handleChange = (event) => {
        event.preventDefault();
        setUsernameInput(event.target.value);
    }

    const handleSubmit = (event) => {
        props.onSubmit(usernameInput);
    }

    return(
        <div id="login">
            <input size="30" value={usernameInput} onChange={handleChange} placeholder="Type your username..." required />
            <button onClick={handleSubmit}>Join the DoorDash Chat!</button>
        </div>
    )
}

export const App = () => {

    const [username, setUsername] = useState(null);

    const onSubmit = (username) => {
        setUsername(username);
    }

    if (username === null) {
        return (
            <Login onSubmit={onSubmit} />
        );
    } else {
        return (
            <Chatroom username={username} />
        );
    }
}