import { useWebSocket } from "../contexts/WebSocketContext"
import RacingType from './RacingType'
import { Users, Trophy, Medal, Award, Crown, Zap } from "lucide-react"

const Race = () => {
    const { users, roomSettings, words, userProgress } = useWebSocket()
    const mode = roomSettings.mode
    const value = roomSettings.value

    // Sort users by WPM (highest first) for dynamic positioning
    const sortedUsers = [...users].sort((a, b) => {
        const aWpm = userProgress[a.id]?.wpm || 0
        const bWpm = userProgress[b.id]?.wpm || 0
        return bWpm - aWpm
    })

    const getRankIcon = (position) => {
        switch (position) {
            case 0: return <Crown className="w-5 h-5 text-yellow-400" />
            case 1: return <Medal className="w-5 h-5 text-gray-300" />
            case 2: return <Award className="w-5 h-5 text-amber-600" />
            default: return <Trophy className="w-4 h-4 text-zinc-500" />
        }
    }

    const getRankStyling = (position) => {
        switch (position) {
            case 0: return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-l-4 border-yellow-500"
            case 1: return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-l-4 border-gray-400"
            case 2: return "bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-l-4 border-amber-500"
            default: return "bg-zinc-900/50 border-l-4 border-transparent"
        }
    }

    const getProgressBarColor = (position) => {
        switch (position) {
            case 0: return "from-yellow-400 to-yellow-600"
            case 1: return "from-gray-300 to-gray-500"
            case 2: return "from-amber-500 to-amber-600"
            default: return "from-blue-500 to-purple-500"
        }
    }
    
    return (
        <div className='flex gap-6 h-screen p-4'>
            {/* Main Typing Section - Takes most width */}
            <div className="flex-1 min-w-0">
                <RacingType text={words} givenMode={mode} givenWordCount={value} givenTimeCount={value}/>
            </div>
            
            {/* Enhanced Typists Section - Fixed width on right */}
            <div className="w-80 flex-shrink-0"> 
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-3 p-4 border-b border-zinc-700/50 flex-shrink-0 bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="custom-color animate-pulse" />
                            <Users size={16} className="custom-color" />
                        </div>
                        <h2 className="text-base font-bold text-white">
                            Live Leaderboard
                        </h2>
                        <div className="ml-auto bg-zinc-700/50 px-2 py-1 rounded-full">
                            <span className="text-xs text-zinc-300 font-medium">{users.length}</span>
                        </div>
                    </div>  

                    <div className="flex-1 p-3 overflow-y-auto min-h-0">
                        {users.length === 0 ? (
                            <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                                <Users size={48} className="mb-4 opacity-50" />
                                <p className="text-sm">Waiting for racers to join...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sortedUsers.map((user, index) => {
                                    const username = user.username || user.name || 'User'
                                    const avatar = (username[0] || '?').toUpperCase()
                                    const progress = userProgress[user.id]?.progress || 0
                                    const wpm = userProgress[user.id]?.wpm || 0
                                    const accuracy = userProgress[user.id]?.accuracy || 0
                                    
                                    return (
                                        <div 
                                            key={user.id || username} 
                                            className={`p-3 rounded-lg transition-all duration-500 hover:bg-zinc-800/30 ${getRankStyling(index)}`}
                                        >
                                            {/* Header with rank, avatar, and username */}
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Rank Icon */}
                                                <div className="flex items-center gap-1 min-w-0">
                                                    {getRankIcon(index)}
                                                    <span className="text-xs font-bold text-zinc-400">#{index + 1}</span>
                                                </div>
                                                
                                                {/* Avatar */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex-shrink-0 shadow-lg">
                                                    {avatar}
                                                </div>
                                                
                                                {/* Username */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-semibold truncate">{username}</div>
                                                </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold custom-color">{wpm}</div>
                                                        <div className="text-xs text-zinc-500">WPM</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-semibold text-green-400">{accuracy}%</div>
                                                        <div className="text-xs text-zinc-500">ACC</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-blue-400">{progress}%</div>
                                                    <div className="text-xs text-zinc-500">Complete</div>
                                                </div>
                                            </div>
                                            
                                            {/* Enhanced Progress bar */}
                                            <div className="relative">
                                                <div className="w-full bg-zinc-700/50 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className={`bg-gradient-to-r ${getProgressBarColor(index)} h-2 rounded-full transition-all duration-500 ease-out relative`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    >
                                                        {progress > 0 && (
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                        )}
                                                    </div>
                                                </div>
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

export default Race