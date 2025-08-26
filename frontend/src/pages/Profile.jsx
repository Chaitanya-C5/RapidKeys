import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Trophy, Target, Activity, Calendar, Award, TrendingUp, Clock, ArrowLeft } from 'lucide-react'
import { get_profile } from '../api/authService'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        if (token) {
          const response = await get_profile(token)
          if (response.data.success) {
            setProfileData(response.data.user)
          } else {
            setError('Failed to load profile')
          }
        }
      } catch (err) {
        setError('Failed to fetch profile data')
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const getAchievements = () => {
    if (!profileData) return []
    
    const achievements = []
    
    // Speed achievements
    if (profileData.best_wpm >= 100) achievements.push({ icon: '🚀', title: 'Speed Demon', desc: '100+ WPM' })
    else if (profileData.best_wpm >= 80) achievements.push({ icon: '⚡', title: 'Fast Fingers', desc: '80+ WPM' })
    else if (profileData.best_wpm >= 60) achievements.push({ icon: '🏃', title: 'Quick Typer', desc: '60+ WPM' })
    
    // Accuracy achievements
    if (profileData.best_accuracy >= 98) achievements.push({ icon: '🎯', title: 'Perfectionist', desc: '98%+ Accuracy' })
    else if (profileData.best_accuracy >= 95) achievements.push({ icon: '🏹', title: 'Sharp Shooter', desc: '95%+ Accuracy' })
    
    // Games played achievements
    if (profileData.total_games >= 100) achievements.push({ icon: '💪', title: 'Dedicated', desc: '100+ Games' })
    else if (profileData.total_games >= 50) achievements.push({ icon: '🎮', title: 'Enthusiast', desc: '50+ Games' })
    else if (profileData.total_games >= 10) achievements.push({ icon: '🌟', title: 'Getting Started', desc: '10+ Games' })
    
    return achievements
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-300 font-mono flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-gray-300 font-mono flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const achievements = getAchievements()

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profileData?.username || 'User'}</h1>
              <p className="text-zinc-400 mb-2">{profileData?.email}</p>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  }) : new Date().getFullYear()}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {profileData?.total_games || 0} games played
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Typing Statistics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {profileData?.best_wpm || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Best WPM</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.round(profileData?.best_accuracy || 0)}%
                  </div>
                  <div className="text-sm text-zinc-400">Best Accuracy</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {Math.round(profileData?.average_wpm || 0)}
                  </div>
                  <div className="text-sm text-zinc-400">Avg WPM</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {profileData?.total_games || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Total Games</div>
                </div>
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Progress Overview
              </h3>
              <div className="text-center py-12 text-zinc-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <p>Progress tracking coming soon!</p>
                <p className="text-sm mt-2">Complete more typing tests to see your improvement over time</p>
              </div>
            </div>
          </div>

          {/* Achievements & Actions */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements
              </h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Award className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                  <p className="text-sm">No achievements yet</p>
                  <p className="text-xs mt-1">Start typing to unlock achievements!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{achievement.title}</div>
                        <div className="text-xs text-zinc-400">{achievement.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/type')}
                  className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Practice Typing
                </button>
                
                <button 
                  onClick={() => navigate('/room')}
                  className="cursor-pointer w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Join Race
                </button>
                
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="cursor-pointer w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
