import React, { useState } from 'react'
import './App.css';
import { Chatroom } from './Chatroom'
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = (props) => {

    const [usernameInput, setUsernameInput] = useState('');

    const handleChange = (event) => {
        setUsernameInput(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const sanitizedUsername = usernameInput.replace(/[^A-Za-z]/ig, '')
        if (sanitizedUsername.length) {
            props.onSubmit(sanitizedUsername);
        } else {
            setUsernameInput('');
        }
    }

    return(
        <div id="login">
            <form onSubmit={handleSubmit}>
                <input value={usernameInput} onChange={handleChange} placeholder="Type your username..." required />
                <button type="submit">Join the DoorDash Chat!</button>
            </form>
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