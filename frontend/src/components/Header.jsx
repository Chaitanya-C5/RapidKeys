import { Zap, Keyboard, Swords, Crown, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <div className="text-gray-300 font-mono bg-black w-full flex flex-col sm:flex-row justify-center items-center px-4 text-lg gap-6 sm:gap-12 md:gap-24 lg:gap-36 xl:gap-52 py-12 sm:mb-8">
      
      <div className="flex items-center gap-2">
        <Zap className="custom-color w-7 h-7" />
        <h1 className="font-bold text-3xl">
          Rapid<span className="custom-color">Keys</span>
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
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

        <div className="flex gap-2 items-center">
          <User className="text-gray-400" />
          <button 
            className='cursor-pointer hover:text-white transition' 
            onClick={() => navigate("/")}>
              Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
