import { useWebSocket } from "../contexts/WebSocketContext"
import RacingType from './RacingType'
import { Users } from "lucide-react"

const Race = () => {
    const { users, roomSettings, words, userProgress } = useWebSocket()
    const mode = roomSettings.mode
    const value = roomSettings.value

    
    return (
        <div className='flex gap-6 h-screen p-4'>
            {/* Main Typing Section - Takes most width */}
            <div className="flex-1 min-w-0">
                <RacingType showModeOptions={false} text={words} givenMode={mode} givenWordCount={value} givenTimeCount={value}/>
            </div>
            
            {/* Typists Section - Fixed width on right */}
            <div className="w-80 flex-shrink-0"> 
                <div className="bg-zinc-900 rounded-lg border border-zinc-700 flex flex-col">
                    <div className="flex items-center gap-2 p-3 border-b border-zinc-700 flex-shrink-0">
                        <Users size={16} className="custom-color" />
                        <h2 className="text-sm font-semibold text-white">
                            Typists ({users.length})
                        </h2>
                    </div>  

                    <div className="flex-1 px-3 py-5 overflow-y-auto min-h-0">
                        {users.length === 0 ? (
                            <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                                <Users size={48} className="mb-4 opacity-50" />
                                <p className="text-sm">No typists in the room yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => {
                                    const username = user.username || user.name || 'User'
                                    const avatar = (username[0] || '?').toUpperCase()
                                    const progress = userProgress[user.id]?.progress || 0 // Assuming progress is 0-100
                                    
                                    return (
                                        <div key={user.id || username} className="p-4 rounded bg-zinc-800 hover:bg-zinc-750 transition-colors">
                                            {/* Single row with all info */}
                                            <div className="flex items-center gap-2">
                                                {/* Avatar */}
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-indigo-600 text-white font-bold text-xs flex-shrink-0">
                                                    {avatar}
                                                </div>
                                                
                                                {/* Username */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-medium truncate">{username}</div>
                                                </div>
                                                
                                                {/* Stats - compact */}
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-blue-400 font-semibold">{userProgress[user.id]?.wpm ?? 0} WPM</span>
                                                    <span className="text-green-400 font-semibold">{userProgress[user.id]?.accuracy ?? 0}%</span>
                                                </div>
                                            </div>
                                            
                                            {/* Progress bar - thin and compact */}
                                            <div className="mt-2">
                                                <div className="w-full bg-zinc-700 rounded-full h-1">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300 ease-out" 
                                                        style={{ width: `${Math.min(userProgress[user.id]?.progress, 100)}%` }}
                                                    ></div>
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