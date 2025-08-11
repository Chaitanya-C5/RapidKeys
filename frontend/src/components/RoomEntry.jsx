import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Hash, Plus, LogIn, Loader2, Users, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const RoomEntry = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Game mode and settings state
  const [selectedMode, setSelectedMode] = useState('time')
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [selectedWordCount, setSelectedWordCount] = useState(25)
  
  // Room management state
  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  // Game modes configuration
  const gameModes = [
    {
      id: 'time',
      name: 'Time Challenge',
      icon: Clock,
      description: 'Type as much as you can within the time limit',
      options: [15, 30, 60, 120, 300]
    },
    {
      id: 'words',
      name: 'Word Count',
      icon: Hash,
      description: 'Race to complete a specific number of words',
      options: [10, 25, 50, 100, 200]
    }
  ]

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      
      // Navigate to multiplayer with room settings
      navigate(`/multiplayer/ABC123`, {
        state: {
          mode: selectedMode,
          duration: selectedMode === 'time' ? selectedDuration : null,
          wordCount: selectedMode === 'words' ? selectedWordCount : null,
          isHost: true
        }
      })
    } catch (error) {
      console.error('Room creation error:', error)
      setError('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinRoomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setIsJoining(true)
    setError('')
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      
      // Navigate to multiplayer room
      navigate(`/multiplayer/${joinRoomCode.toUpperCase()}`, {
        state: {
          isHost: false
        }
      })
    } catch (error) {
      console.error('Room join error:', error)
      setError('Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const getCurrentModeOptions = () => {
    const mode = gameModes.find(m => m.id === selectedMode)
    return mode ? mode.options : []
  }

  const getCurrentValue = () => {
    return selectedMode === 'time' ? selectedDuration : selectedWordCount
  }

  const handleOptionChange = (value) => {
    if (selectedMode === 'time') {
      setSelectedDuration(value)
    } else if (selectedMode === 'words') {
      setSelectedWordCount(value)
    }
  }

  return (
    <div className="w-full flex flex-col items-center custom-font px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Multiplayer Setup</h1>
        <p className="text-gray-400">Configure your race settings and create or join a room</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-4xl mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-4xl">
        {/* Game Mode Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="custom-color" />
            <h2 className="text-xl font-semibold text-white">Game Mode</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameModes.map(mode => {
              const Icon = mode.icon
              return (
                <div
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-6 rounded-lg border cursor-pointer transition hover:scale-105 ${
                    selectedMode === mode.id
                      ? 'border-green-500 custom-bgcolor bg-opacity-10 text-black'
                      : 'border-zinc-600 hover:border-zinc-500 bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={24} className={selectedMode === mode.id ? 'custom-color' : 'text-gray-400'} />
                    <h3 className={`text-lg font-semibold ${selectedMode === mode.id ? 'text-black' : 'text-white'}`}>{mode.name}</h3>
                  </div>
                  <p className={`text-sm ${selectedMode === mode.id ? 'text-black' : 'text-white'}`}>{mode.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mode Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedMode === 'time' ? 'Duration (seconds)' : 'Word Count'}
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {getCurrentModeOptions().map(option => (
              <button
                key={option}
                onClick={() => handleOptionChange(option)}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition hover:scale-105 ${
                  getCurrentValue() === option
                    ? 'custom-bgcolor text-black'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                {option}
                {selectedMode === 'time' ? 's' : ' words'}
              </button>
            ))}
          </div>
        </div>

        {/* Room Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="custom-color" size={20} />
              <h2 className="text-xl font-semibold text-white">Create New Room</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="font-medium text-white mb-3">Current Settings:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="text-white font-medium">{gameModes.find(m => m.id === selectedMode)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedMode === 'time' ? 'Duration:' : 'Words:'}</span>
                    <span className="text-white font-medium">
                      {getCurrentValue()}{selectedMode === 'time' ? 's' : ' words'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 custom-bgcolor hover:bg-opacity-80 disabled:bg-zinc-700 disabled:text-gray-500 text-black font-semibold rounded-lg transition flex items-center justify-center gap-2 text-lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <LogIn className="custom-color" size={20} />
              <h2 className="text-xl font-semibold text-white">Join Existing Room</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="Enter 6-character room code"
                  maxLength={6}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-center text-xl tracking-widest"
                />
                
                {/* Visual room code display */}
                <div className="flex justify-center mt-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-lg font-mono ${
                          i < joinRoomCode.length
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : "border-zinc-600 bg-zinc-800 text-gray-500"
                        }`}
                      >
                        {joinRoomCode[i] || ""}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || joinRoomCode.length < 6}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Joining Room...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Join Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomEntry