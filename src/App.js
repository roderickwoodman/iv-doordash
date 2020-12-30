import React, { useState, useEffect } from 'react'
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
        const sanitizedUsername = usernameInput.replace(/[^A-Za-z ]/ig, '')
        if (sanitizedUsername.length) {
            const now = new Date().getTime();
            const newUser = {
                name: sanitizedUsername,
                sessionStart: now,
            }
            props.onSubmit(newUser);
        } else {
            setUsernameInput('');
        }
    }

    return(
        <div id="login">
            { props.afterLogout &&
            <p>You have been logged out.</p>
            }
            <form onSubmit={handleSubmit}>
                <input value={usernameInput} onChange={handleChange} placeholder="Type your username..." required />
                <button type="submit">Join the DoorDash Chat!</button>
            </form>
        </div>
    )
}

export const App = () => {

    const [newUser, setNewUser] = useState(null);
    const [afterLogout, setAfterLogout] = useState(false);

    useEffect( () => {

        // If user info was stored, load it
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser !== null) {
            setNewUser(storedUser);
        }

    }, [])

    const onSubmit = (newUser) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        setNewUser(newUser);
    }

    const onLogout = () => {
        localStorage.removeItem('user');
        setNewUser(null);
        setAfterLogout(true);
    }

    if (newUser === null) {
        return (
            <Login onSubmit={onSubmit} afterLogout={afterLogout}/>
        );
    } else {
        return (
            <Chatroom user={newUser} onLogout={onLogout} />
        );
    }
}