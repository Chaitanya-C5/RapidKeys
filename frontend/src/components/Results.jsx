import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Home, Users, ArrowLeft } from 'lucide-react'
import { useWebSocket } from '../contexts/WebSocketContext'

function Results() {
  const navigate = useNavigate()
  const { userProgress, users, roomSettings } = useWebSocket()

  // Calculate final rankings
  const finalRankings = Object.entries(userProgress)
    .map(([userId, progress]) => {
      const user = users.find(u => u.id === userId)
      return {
        userId,
        username: user?.username || 'Unknown',
        wpm: progress.wpm || 0,
        accuracy: progress.accuracy || 0,
        progress: progress.progress || 0
      }
    })
    .sort((a, b) => {
      // Sort by progress first, then by WPM
      if (b.progress !== a.progress) return b.progress - a.progress
      return b.wpm - a.wpm
    })

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '👑'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400'
      case 1: return 'text-gray-300'
      case 2: return 'text-amber-600'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto my-12">
        {/* Header */}
        <div className="relative mb-8">
          <button
            onClick={() => navigate('/room')}
            className="cursor-pointer absolute left-0 top-0 flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Rooms
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏁 Race Results</h1>
            <p className="text-gray-400">
              {roomSettings.mode === 'time' ? `${roomSettings.value}s` : `${roomSettings.value} words`} • 
              {roomSettings.mode} mode
            </p>
          </div>
        </div>

        {/* Final Rankings */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Final Rankings
          </h2>
          
          <div className="space-y-4">
            {finalRankings.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-900/30 border border-yellow-500/30' :
                  index === 1 ? 'bg-gray-700/50 border border-gray-500/30' :
                  index === 2 ? 'bg-amber-900/30 border border-amber-500/30' :
                  'bg-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </span>
                  <div>
                    <p className="font-semibold text-lg">{user.username}</p>
                    <p className="text-sm text-gray-400">
                      {user.progress}% completed
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-400">{user.wpm} WPM</p>
                  <p className="text-sm text-gray-400">{user.accuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/leaderboard')}
            className="cursor-pointer flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Trophy className="w-5 h-5" />
            View Leaderboard
          </button>
          
          <button
            onClick={() => navigate('/room')}
            className="cursor-pointer flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            New Race
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {/* Race Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Race Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">{finalRankings.length}</p>
              <p className="text-sm text-gray-400">Total Racers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {Math.max(...finalRankings.map(u => u.wpm))}
              </p>
              <p className="text-sm text-gray-400">Highest WPM</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {finalRankings.length > 0 
                  ? Math.round(finalRankings.reduce((sum, u) => sum + parseFloat(u.accuracy || 0), 0) / finalRankings.length)
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">Avg Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">
                {roomSettings.mode === 'time' ? `${roomSettings.value}s` : `${roomSettings.value}`}
              </p>
              <p className="text-sm text-gray-400">
                {roomSettings.mode === 'time' ? 'Duration' : 'Words'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
