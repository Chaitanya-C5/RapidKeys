import React, { useState } from 'react'
import { Clock, Hash, Plus, LogIn, Loader2, Settings } from 'lucide-react'

const RoomEntry = () => {
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
      options: [15, 30, 60, 100]
    },
    {
      id: 'words',
      name: 'Word Count',
      icon: Hash,
      description: 'Race to complete a specific number of words',
      options: [10, 25, 50, 75]
    }
  ]

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Room created with settings:', {
        mode: selectedMode,
        value: selectedMode === 'time' ? selectedDuration : selectedWordCount
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Joined room:', joinRoomCode)
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
    <div className="bg-black text-white font-mono">
      <div className="container mx-auto px-4 py-6 max-w-8xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Multiplayer Setup</h1>
          <p className="text-gray-400 text-sm">Configure your race settings and create or join a room</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-300px)]">
          {/* Left Column - Game Mode Selection */}
          <div className="lg:col-span-1 h-full">
            <div className="flex items-center gap-2 mb-4 pt-3">
              <Settings size={20} className="text-green-500" />
              <h2 className="text-lg font-semibold text-white">Game Mode</h2>
            </div>
            
            <div className="space-y-3 h-[calc(100%-2.5rem)]">
              {gameModes.map(mode => {
                const Icon = mode.icon
                return (
                  <div
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] flex-1 ${
                      selectedMode === mode.id
                        ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className={selectedMode === mode.id ? 'text-green-400' : 'text-gray-400'} />
                      <h3 className={`text-lg font-semibold ${selectedMode === mode.id ? 'text-green-400' : 'text-white'}`}>
                        {mode.name}
                      </h3>
                    </div>
                    <p className={`text-xs leading-relaxed ${selectedMode === mode.id ? 'text-green-200' : 'text-gray-400'}`}>
                      {mode.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Mode Options and Room Actions */}
          <div className="flex flex-col justify-around lg:col-span-3 space-y-4 h-full overflow-y-auto">
            {/* Mode Options */}
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedMode === 'time' ? 'Duration (seconds)' : 'Word Count'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getCurrentModeOptions().map(option => (
                  <button
                    key={option}
                    onClick={() => handleOptionChange(option)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 min-w-[80px] ${
                      getCurrentValue() === option
                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {option}
                    {selectedMode === 'time' ? 's' : ' words'}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Actions */}
            <div className="grid md:grid-cols-2 gap-4 flex-1">
              {/* Create Room */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Plus className="text-green-500" size={20} />
                  <h2 className="text-lg font-semibold text-white">Create New Room</h2>
                </div>
                
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="p-3 bg-zinc-800/50 rounded-md border border-zinc-700 flex-1">
                    <h4 className="font-medium text-white mb-3 text-sm">Current Settings:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-md">Mode:</span>
                        <span className="text-green-400 font-medium text-md">
                          {gameModes.find(m => m.id === selectedMode)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-md">{selectedMode === 'time' ? 'Duration:' : 'Words:'}</span>
                        <span className="text-green-400 font-medium text-md">
                          {getCurrentValue()}{selectedMode === 'time' ? 's' : ' words'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-gray-500 text-black font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:shadow-green-500/30"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Room
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Join Room */}
              <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <LogIn className="text-blue-500" size={20} />
                  <h2 className="text-lg font-semibold text-white">Join Existing Room</h2>
                </div>
                
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col justify-around">
                    <label className="block text-md font-medium text-gray-400 mb-2">
                      Room Code
                    </label>
                    <input  
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                      placeholder="ABCD12"
                      maxLength={6}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-center text-lg tracking-wider transition-colors"
                    />
                    
                    {/* Visual room code display */}
                    <div className="flex justify-center mt-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 border rounded-md flex items-center justify-center text-sm font-mono transition-all ${
                              i < joinRoomCode.length
                                ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm"
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
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-gray-500 text-white font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Joining Room...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        Join Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomEntry
