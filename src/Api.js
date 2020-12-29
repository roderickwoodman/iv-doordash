// Rooms List API
export const roomsListApi = () => {
    return (
        fetch('http://localhost:8080/api/rooms')
        .then( response => response.json() )
    )
}