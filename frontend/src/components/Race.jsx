import { useWebSocket } from "../contexts/WebSocketContext"

const Race = () => {
    const { users, roomSettings, raceStarted, hostId, updateTypingProgress } = useWebSocket()
    return (
        <div>
            <h1>Race</h1>
        </div>
    )
}

export default Race