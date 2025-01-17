import React, { useState, useEffect } from 'react'
import socketClient from 'socket.io-client'
import PropTypes from 'prop-types'
import './App.css'
import backgroundPhoto from './img/julian-rivera--hvhdqafQx8-unsplash-1920x1080dklr.jpg'
import { Chatroom } from './Chatroom'
import 'bootstrap/dist/css/bootstrap.min.css'


const Login = (props) => {

    const [usernameInput, setUsernameInput] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [validUsername, setValidUsername] = useState(null);

    const handleChange = (event) => {

        const potentialUsername = event.target.value;

        setUsernameInput(potentialUsername);

        const validationErrors = validate(potentialUsername);
        if (validationErrors.hasOwnProperty('chars')) {
            setValidUsername(null);
            setErrorMessage(validationErrors.chars);
        } else if (validationErrors.hasOwnProperty('lenlong')) {
            setValidUsername(null);
            setErrorMessage(validationErrors.lenlong);
        } else if (validationErrors.hasOwnProperty('lenshort')) {
            setValidUsername(null);
            setErrorMessage(validationErrors.lenshort);
        } else if (validationErrors.hasOwnProperty('spaces')) {
            setValidUsername(null);
            setErrorMessage(validationErrors.spaces);
        } else {
            setValidUsername(potentialUsername.trim());
            setErrorMessage(null);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validUsername  !== null) {
            const now = new Date().getTime();
            const newUser = {
                name: usernameInput.trim(),
                sessionStart: now,
            }
            props.onSubmit(newUser);
        }
    }

    const validate = (value) => {
        let errors = {};
        const legalCharacters = value.replace(/[^A-Za-z \-'.]/ig, '');
        if (legalCharacters !== value) {
            errors['chars'] = `Invalid. Please use only A-Z, -, ', ., and space.`;
        }
        const legalNonspaceCharacters = value.replace(/[^A-Za-z-'.]/ig, '');
        if (legalNonspaceCharacters.length && legalNonspaceCharacters.length < 3) {
            errors['lenshort'] = `Invalid. Must be at least 3 characters.`;
        }
        if (value.length > 18) {
            errors['lenlong'] = `Invalid. Must be no more than 18 characters.`;
        }
        const matchedConsecutiveSpaces = value.match(/\s{2,}/);
        if (matchedConsecutiveSpaces !== null) {
            errors['spaces'] = `Invalid. Consecutive spaces are not allowed.`;
        }
        return errors;
    }

    return(
        <div id="login" style={{ backgroundImage: `url(${backgroundPhoto})` }}>
            { props.afterLogout &&
            <p>You have been logged out.</p>
            }
            <form onSubmit={handleSubmit}>
                <div>
                    <label className="hide-element" htmlFor="username">Username:</label>
                    <input id="username" type="text" value={usernameInput} onChange={handleChange} placeholder="Type your username..." autoFocus required />
                    <p className="error">{(errorMessage === null) ? ''  : errorMessage}</p>
                </div>
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
    const [mailboxIsFull, setMailboxIsFull] = useState(false);

    useEffect( () => {

        // If user info was stored, load it
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser !== null) {
            setNewUser(storedUser);
        }

        // Establish a websocket with the back end
        const SERVER = 'http://localhost:8080';
        //const SERVER = 'http://localhost:8081'; // for GCP deployment
        // console.log('using SERVER:',SERVER);
        const socket = socketClient(SERVER, {transports: ['websocket']});
        socket.on('connection', (arg1) => {
            console.log(`${arg1} [${SERVER}]`);
        })
        socket.on('sendMessage', (arg1) => {
            if (arg1 === 'dataWasPosted') {
                setMailboxIsFull(true);
            }
        })

        return () => socket.disconnect();

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

    const onClearMailbox = () => {
        setMailboxIsFull(false);
    }

    if (newUser === null) {
        return (
            <Login onSubmit={onSubmit} afterLogout={afterLogout} />
        );
    } else {
        return (
            <Chatroom user={newUser} onLogout={onLogout} mailboxIsFull={mailboxIsFull} onClearMailbox={onClearMailbox} />
        );
    }
}