import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  connectToRoom,
  sendChatMessage,
  startRace,
  sendTypingProgress,
} from "../api/multiplayer.js";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ roomCode, children }) => {

    const [chatMessages, setChatMessages] = useState([])
    const [users, setUsers] = useState([])
    const [roomSettings, setRoomSettings] = useState({})
    const [raceStarted, setRaceStarted] = useState(false)
    const [hostId, setHostId] = useState(null) 
    const wsRef = useRef(null)
    const currentUserId = JSON.parse(localStorage.getItem("userData")).id

    // WebSocket connection
    useEffect(() => {
        if (!roomCode) return
 
        const wsConnection = connectToRoom(roomCode, {
            onMessage: (data) => {
                switch (data.type) {
                    case 'room_joined': {
                        const room = data.room || {}
                        setUsers(Object.values(room.users || {}))
                        setRoomSettings(room.settings || {})
                        setRaceStarted(room.race_started)
                        setChatMessages((room.messages || []).map((m, idx) => ({ id: idx + 1, ...m })))
                        setHostId(room.creator_id)
                        break
                    }
                    case 'user_joined': {
                        if (Array.isArray(data.room_users)) setUsers(data.room_users)
                        break
                    }
                    case 'user_left': {
                        if (Array.isArray(data.room_users)) setUsers(data.room_users)
                        break
                    }
                    case 'chat_message': {
                        const msg = data.message || data
                        //msg.timestamp = new Date(msg.timestamp);
                        setChatMessages((prev) => [...prev, { id: prev.length + 1, ...msg }])
                        break
                    }
                    case 'typing_progress':
                    case 'race_started': {
                        // extend later as needed
                        break
                    }
                    default:
                        break
                }
            },
            onOpen: () => {
                console.log('Connected to room:', roomCode)
            },
            onClose: () => {
                console.log('Disconnected from room:', roomCode)
            },
            onError: (error) => {
                console.error('WebSocket error in room:', roomCode, error)
            }
        })

        if (wsConnection) {
            wsRef.current = wsConnection
        }

        return () => {
            wsConnection?.close()
            wsRef.current = null
        }
    }, [roomCode, currentUserId])

    const sendMessage = (message) => {
        sendChatMessage(wsRef.current, message)
    }

    const beginRace = useCallback(() => {
        startRace(wsConnectionRef.current);
    }, []);
    
    const updateTypingProgress = useCallback((progress, wpm, accuracy) => {
        sendTypingProgress(wsConnectionRef.current, progress, wpm, accuracy);
    }, []);

    return (
        <WebSocketContext.Provider value={{
            users,
            chatMessages,
            roomSettings,
            raceStarted,
            hostId,
            wsRef,
            sendMessage,
            beginRace,
            updateTypingProgress
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};
