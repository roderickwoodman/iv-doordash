// Rooms List API
export const roomsListApi = () => {
    return (
        fetch('/api/rooms')
        .then( response => response.json() )
    )
}

// Rooms Detail API
export const roomsDetailApi = (roomId) => {
    return (
        fetch(`/api/rooms/${roomId}`)
        .then( response => response.json() )
    )
}

// Messages API (GET)
export const messagesApi = (roomId) => {
    return (
        fetch(`/api/rooms/${roomId}/messages`)
        .then( response => response.json() )
    )
}

// Messages API (POST)
export const newMessageApi = (roomId, name, message) => {
    const data = {
        name: name,
        message: message,
    }
    return (
        fetch(`/api/rooms/${roomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then( response => response.json() )
    )
}