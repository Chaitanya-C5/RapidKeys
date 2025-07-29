import { Zap, Keyboard, Swords, Crown, User, LogIn, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="text-gray-300 font-mono bg-black w-full flex flex-col sm:flex-row justify-between items-center px-4 text-lg py-12 sm:mb-8">
      
      <div className="flex items-center gap-2">
        <Zap className="custom-color w-7 h-7" />
        <h1 className="font-bold text-3xl cursor-pointer"
          onClick={() => navigate("/")}>
          Rapid<span className="custom-color">Keys</span>
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center">
        <div className="flex gap-2 items-center">
          <Keyboard className="text-gray-400 mt-0.5" />
          <button 
            className='cursor-pointer hover:text-white transition' 
            onClick={() => navigate("/type")}>
              Type
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <Swords className="text-gray-400" />
          <button 
            className='cursor-pointer hover:text-white transition' 
            onClick={() => navigate("/")}>
              Multiplayer
            </button>
        </div>

        <div className="flex gap-2 items-center">
          <Crown className="text-gray-400" />
          <button 
            className='cursor-pointer hover:text-white transition' 
            onClick={() => navigate("/")}>
              Leaderboard
          </button>
        </div>

      </div>

      {/* Authentication Section - Right Side */}
      <div className="flex items-center">
        {isAuthenticated ? (
          // Show Profile and Logout for logged-in users
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <User className="text-gray-400" />
              <button 
                className='cursor-pointer hover:text-white transition' 
                onClick={() => navigate("/profile")}>
                  {user?.username || 'Profile'}
              </button>
            </div>
            <button 
              className='cursor-pointer hover:text-red-400 transition text-sm' 
              onClick={logout}>
                Logout
            </button>
          </div>
        ) : (
          // Show elegant outlined button style for guests
          <div className="flex items-center gap-3">
            <button 
              className='px-4 py-2 text-sm border border-zinc-600 rounded-md hover:border-zinc-400 hover:text-white transition' 
              onClick={() => navigate("/login")}>
                Sign in
            </button>
            <button 
              className='px-4 py-2 text-sm custom-bgcolor rounded-md hover:opacity-90 transition font-semibold text-white' 
              onClick={() => navigate("/signup")}>
                Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
