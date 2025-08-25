import { Trophy, Medal, Award, Crown, ArrowLeft } from "lucide-react"
import { useState } from "react"

function Leaderboard() {
  // Sample data - replace with your actual data source
  const [leaderboardData] = useState([
    { username: "TypeMaster_Pro", wpm: 127, accuracy: 98.5, position: 1 },
    { username: "SpeedDemon", wpm: 119, accuracy: 97.2, position: 2 },
    { username: "KeyboardWarrior", wpm: 115, accuracy: 99.1, position: 3 },
    { username: "RapidFingers", wpm: 108, accuracy: 96.8, position: 4 },
    { username: "FlashTyper", wpm: 104, accuracy: 98.0, position: 5 },
    { username: "CodeNinja", wpm: 98, accuracy: 95.5, position: 6 },
    { username: "TypingAce", wpm: 94, accuracy: 97.8, position: 7 },
    { username: "QuickKeys", wpm: 89, accuracy: 94.2, position: 8 },
    { username: "WordSprinter", wpm: 85, accuracy: 96.1, position: 9 },
    { username: "LetterLightning", wpm: 82, accuracy: 93.7, position: 10 },
    { username: "TextTornado", wpm: 78, accuracy: 95.9, position: 11 },
    { username: "KeystrokeKing", wpm: 75, accuracy: 92.4, position: 12 }
  ])

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

  const getRankStyling = (position) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40"
      case 3:
        return "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/40"
      default:
        return "bg-zinc-900/50 border-zinc-700/50"
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono py-4 flex px-8">
        {/* Back Button */}
        <div className="mb-6 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white hover:custom-color transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:custom-color" />
            <span className="text-sm font-bold">Back</span>
          </button>
        </div>
      <div className="max-w-4xl mx-auto">
        
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
        <div className="bg-zinc-900/30 rounded-lg border border-zinc-700/50 overflow-hidden">
          {/* Table Header */}
          <div className="bg-zinc-800/50 border-b border-zinc-700/50 p-4">
            <div className="grid grid-cols-12 gap-4 font-bold text-sm text-zinc-300">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5 md:col-span-6">Username</div>
              <div className="col-span-3 md:col-span-2 text-center">WPM</div>
              <div className="col-span-3 md:col-span-3 text-center">Accuracy</div>
            </div>
          </div>

          {/* Leaderboard Entries */}
          <div className="divide-y divide-zinc-700/50">
            {leaderboardData.map((player, index) => (
              <div
                key={player.username}
                className={`p-4 transition-all duration-200 hover:bg-zinc-800/30 ${getRankStyling(player.position)} border-l-4`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center items-center">
                    <div className="flex items-center gap-2">
                      {getRankIcon(player.position)}
                      <span className="font-bold text-sm hidden sm:block">
                        #{player.position}
                      </span>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="col-span-5 md:col-span-6">
                    <span className="font-bold text-white text-sm md:text-base truncate block">
                      {player.username}
                    </span>
                  </div>

                  {/* WPM */}
                  <div className="col-span-3 md:col-span-2 text-center">
                    <span className="custom-color font-bold text-lg md:text-xl">
                      {player.wpm}
                    </span>
                    <span className="text-zinc-500 text-xs block">WPM</span>
                  </div>

                  {/* Accuracy */}
                  <div className="col-span-3 md:col-span-3 text-center">
                    <span className="text-white font-bold text-sm md:text-base">
                      {player.accuracy}%
                    </span>
                    <span className="text-zinc-500 text-xs block">Accuracy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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