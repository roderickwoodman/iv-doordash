// Rooms List API
export const roomsListApi = () => {
    return (
        fetch('http://localhost:8080/api/rooms')
        .then( response => response.json() )
    )
}

// Rooms Detail API
export const roomsDetailApi = (roomId) => {
    return (
        fetch(`http://localhost:8080/api/rooms/${roomId}`)
        .then( response => response.json() )
    )
}

// Messages API
export const messagesApi = (roomId) => {
    return (
        fetch(`http://localhost:8080/api/rooms/${roomId}/messages`)
        .then( response => response.json() )
    )
}