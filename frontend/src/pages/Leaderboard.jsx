import { Trophy, Medal, Award, Crown, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { getLeaderboard } from "../api/authService"

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await getLeaderboard(50)
        if (response.success) {
          setLeaderboardData(response.leaderboard)
        } else {
          setError(response.error || 'Failed to fetch leaderboard')
        }
      } catch (err) {
        setError('Failed to fetch leaderboard data')
        console.error('Leaderboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Trophy className="w-5 h-5 text-zinc-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-300 font-mono py-4 flex px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Loading leaderboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono py-4 flex px-8 w-full">
      {/* Back Button */}
      <div className="mb-6 pt-4">
        <button 
          onClick={() => window.history.back()}
          className="cursor-pointer flex items-center gap-2 text-zinc-400 hover:text-white hover:custom-color transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:custom-color" />
          <span className="text-sm font-bold">Back</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-white font-bold text-4xl md:text-5xl mb-4">
            <span className="custom-color">RapidKeys</span> Leaderboard
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Top performers ranked by Words Per Minute
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 custom-color" />
              Top Typists
            </h2>
          </div>
          
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No leaderboard data available yet</p>
              <p className="text-zinc-500 text-sm mt-2">Complete some typing tests to see rankings!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {leaderboardData.map((user) => (
                <div key={user.position} className="px-6 py-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(user.position)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{user.username}</h3>
                        <p className="text-zinc-400 text-sm">{user.total_games || 0} games played</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">{user.wpm} WPM</p>
                        <p className="text-zinc-400 text-sm">Best Speed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">{user.accuracy}%</p>
                        <p className="text-zinc-400 text-sm">Best Accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-300 font-semibold">#{user.position}</p>
                        <p className="text-zinc-500 text-sm">Rank</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 p-6 text-center">
            <div className="custom-color text-2xl font-bold mb-2">
              {leaderboardData.length}
            </div>
            <div className="text-zinc-400 text-sm">Total Players</div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 p-6 text-center">
            <div className="custom-color text-2xl font-bold mb-2">
              {Math.max(...leaderboardData.map(p => p.wpm))}
            </div>
            <div className="text-zinc-400 text-sm">Highest WPM</div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 p-6 text-center">
            <div className="custom-color text-2xl font-bold mb-2">
              {Math.round(leaderboardData.reduce((acc, p) => acc + p.wpm, 0) / leaderboardData.length)}
            </div>
            <div className="text-zinc-400 text-sm">Average WPM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard