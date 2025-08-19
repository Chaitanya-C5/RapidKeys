import React, { useState, useRef, useEffect } from 'react'
import { Copy, Send, Users, MessageSquare } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWebSocket } from '../contexts/WebSocketContext'  // ✅ Import the context

const Multiplayer = () => {
  const [copied, setCopied] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const chatEndRef = useRef(null)

  const { roomCode } = useParams()
  const currentUserId = JSON.parse(localStorage.getItem("userData")).id

  const navigate = useNavigate()

  // ✅ Pull everything from WebSocketContext
  const {
    users,
    chatMessages,
    roomSettings,
    raceStarted,
    hostId, 
    sendMessage,
    beginRace,
  } = useWebSocket()

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    console.log('Sending message:', newMessage)
    if (!newMessage.trim()) return
    sendMessage(newMessage.trim())  // ✅ use context function
    setNewMessage('')
  }

  const handleStartRace = () => {
    beginRace() // ✅ delegate to context
    navigate('race')
  }

  return (
    <div className="bg-black text-gray-300 custom-font flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center py-3 px-12 flex-shrink-0 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white">
            {roomSettings.name || "Test Room"} | T {roomSettings.wordCount || 25} words
          </h1>
          <div className="flex items-center gap-2 text-xs relative">
            <span className="text-gray-400"># Room Code:</span>
            <span className="text-white font-semibold">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="p-1 hover:bg-zinc-800 rounded transition cursor-pointer"
              title="Copy room code"
            >
              <Copy size={16} className="text-gray-400 hover-custom" />
            </button>
            {copied && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-600 px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                Copied!
              </div>
            )}
          </div>
        </div>

        {hostId === currentUserId ? (
          <button
            onClick={handleStartRace}
            className="px-3 py-1 custom-bgcolor hover:bg-opacity-80 text-black font-semibold rounded-md transition text-sm cursor-pointer"
          >
            Start Race
          </button>
        ) : (
          <p className="text-gray-400">
            {raceStarted ? "Race has started" : "Waiting for host to start race"}
          </p>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)] min-h-0 px-8 pb-4 pt-8">
        
        {/* Chat Section */}
        <div className="lg:col-span-3 bg-zinc-900 rounded-lg border border-zinc-700 flex flex-col min-h-0">
          <div className="flex items-center gap-2 p-2 border-b border-zinc-700 flex-shrink-0">
            <MessageSquare size={16} className="custom-color" />
            <h2 className="text-sm font-semibold text-white">Chat</h2>
          </div>

          <div className="flex-1 p-2 overflow-y-auto space-y-1.5 min-h-0">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      {(msg.username || '')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-white font-semibold text-xs">{msg.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-300 break-words text-xs">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          <div className="p-2 border-t border-zinc-700 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md px-2 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-xs"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-2 py-1 custom-bgcolor hover:bg-opacity-80 disabled:bg-zinc-700 disabled:text-gray-500 text-black rounded-md transition"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Typists Section */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 flex flex-col min-h-0">
          <div className="flex items-center gap-2 p-2 border-b border-zinc-700 flex-shrink-0">
            <Users size={16} className="custom-color" />
            <h2 className="text-sm font-semibold text-white">
              Typists ({users.length})
            </h2>
          </div>  

          <div className="flex-1 p-2 overflow-y-auto min-h-0">
            {users.length === 0 ? (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Users size={48} className="mb-4 opacity-50" />
                <p>No typists in the room yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const username = user.username || user.name || 'User'
                  const avatar = (username[0] || '?').toUpperCase()
                  return (
                    <div key={user.id || username} className="flex items-center justify-between p-2 rounded bg-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 text-white font-bold">
                          {avatar}
                        </div>
                        <div>
                          <div className="text-white font-medium">{username}</div>
                          <div className="text-xs text-gray-400">{user.ready ? 'Ready' : 'Not ready'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">{user.wpm ?? 0} WPM</div>
                        <div className="text-gray-400 text-sm">{user.accuracy ?? 0}% ACC</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Multiplayer
