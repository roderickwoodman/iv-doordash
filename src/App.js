import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './App.css';
import { Chatroom } from './Chatroom'
import 'bootstrap/dist/css/bootstrap.min.css'


const Login = (props) => {

    const [usernameInput, setUsernameInput] = useState('');

    const handleChange = (event) => {
        setUsernameInput(event.target.value);
    }

    // Valid usernames are at least 3 characters of alphas and spaces only
    const handleSubmit = (event) => {
        event.preventDefault();
        const sanitizedUsername = usernameInput.replace(/[^A-Za-z ]/ig, '').trim();
        if (sanitizedUsername.length > 2) {
            const now = new Date().getTime();
            const newUser = {
                name: sanitizedUsername,
                sessionStart: now,
            }
            props.onSubmit(newUser);
        } else if (sanitizedUsername.length > 0) {
            setUsernameInput(sanitizedUsername);
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

Login.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    afterLogout: PropTypes.bool.isRequired,
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
        localStorage.clear();
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