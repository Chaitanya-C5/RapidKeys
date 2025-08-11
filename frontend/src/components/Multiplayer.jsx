import React, { useState, useRef, useEffect } from 'react'
import { Copy, Send, Users, MessageSquare } from 'lucide-react'

const Multiplayer = () => {
  const [roomCode] = useState('TXE531') // Mock room code
  const [wordCount] = useState(25)
  const [chatMessages, setChatMessages] = useState([
    // Add some mock messages to demonstrate scrolling
    { id: 1, username: 'Alice', message: 'Hey everyone! Ready to race?', timestamp: new Date() },
    { id: 2, username: 'Bob', message: 'Let\'s do this!', timestamp: new Date() },
    { id: 3, username: 'Charlie', message: 'Good luck everyone', timestamp: new Date() },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [typists] = useState([
    { id: 1, username: 'Chaitanya', avatar: 'C', color: 'bg-pink-500' },
    { id: 2, username: 'Alice', avatar: 'A', color: 'bg-blue-500' },
    { id: 3, username: 'Bob', avatar: 'B', color: 'bg-purple-500' },
    { id: 4, username: 'Charlie', avatar: 'C', color: 'bg-yellow-500' },
    { id: 5, username: 'Diana', avatar: 'D', color: 'bg-red-500' },
    { id: 6, username: 'Eve', avatar: 'E', color: 'bg-green-500' },
    { id: 7, username: 'Frank', avatar: 'F', color: 'bg-indigo-500' },
  ])
  const chatEndRef = useRef(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    // You could add a toast notification here
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        username: 'You',
        message: newMessage,
        timestamp: new Date()
      }])
      setNewMessage('')
    }
  }

  const handleStartRace = () => {
    // TODO: Implement race start logic
    console.log('Starting race...')
  }

  return (
    <div className="bg-black text-gray-300 custom-font flex flex-col">
      {/* Header Section - Fixed height */}
      <div className="flex justify-between items-center py-3 px-12 flex-shrink-0 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white">
            Test Room | T {wordCount} words
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400"># Room Code:</span>
            <span className="text-white font-semibold">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="p-1 hover:bg-zinc-800 rounded transition"
              title="Copy room code"
            >
              <Copy size={16} className="text-gray-400 hover-custom" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleStartRace}
          className="px-3 py-1 custom-bgcolor hover:bg-opacity-80 text-black font-semibold rounded-md transition text-sm"
        >
          Start Race
        </button>
      </div>

      {/* Main Content - Flexible height */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)] min-h-0 px-8 pb-4 pt-8">
        
        {/* Chat Section - Takes 3/4 of the space */}
        <div className="lg:col-span-3 bg-zinc-900 rounded-lg border border-zinc-700 flex flex-col min-h-0">
          {/* Chat Header */}
          <div className="flex items-center gap-2 p-2 border-b border-zinc-700 flex-shrink-0">
            <MessageSquare size={16} className="custom-color" />
            <h2 className="text-sm font-semibold text-white">Chat</h2>
          </div>

          {/* Messages Area - Scrollable */}
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
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {msg.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-white font-semibold text-xs">{msg.username}</span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString()}
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

          {/* Message Input - Fixed at bottom */}
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

        {/* Typists Section - Takes 1/4 of the space */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 flex flex-col min-h-0">
          {/* Typists Header */}
          <div className="flex items-center gap-2 p-2 border-b border-zinc-700 flex-shrink-0">
            <Users size={16} className="custom-color" />
            <h2 className="text-sm font-semibold text-white">
              Typists ({typists.length})
            </h2>
          </div>

          {/* Typists List - Scrollable */}
          <div className="flex-1 p-2 overflow-y-auto min-h-0">
            {typists.length === 0 ? (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Users size={48} className="mb-4 opacity-50" />
                <p>No typists in the room yet.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {typists.map(typist => (
                  <div key={typist.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-zinc-800 transition scroll-hover">
                    <div className={`w-7 h-7 ${typist.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs`}>
                      {typist.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold scroll-item transition-colors truncate text-xs">{typist.username}</p>
                      <p className="text-xs text-gray-500">Ready</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Info - Fixed at bottom */}
          <div className="p-2 border-t border-zinc-700 flex-shrink-0">
            <div className="text-xs text-gray-500 text-center">
              <span className="custom-underline">Room Code Copied!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Multiplayer