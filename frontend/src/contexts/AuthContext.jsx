import { createContext, useContext, useState, useEffect } from 'react'
import axiosClient from '../api/api'

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

// Create Auth Context
const AuthContext = createContext()

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check localStorage for auth token or user data
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        // TODO: Validate token with backend
        setUser(JSON.parse(userData))
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post('/login', { email, password })
      
      if (data.success) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        setUser(data.user)
        setIsAuthenticated(true)
        
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.message || 'Network error. Please try again.' }
    }
  }

  const signup = async (userData) => {  
    try {
      const { data } = await axiosClient.post('/signup', userData)
      
      if (data.success) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        setUser(data.user)
        setIsAuthenticated(true)
        
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.message || 'Signup failed' }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: error.response?.data?.message || 'Network error. Please try again.' }
    }
  }

  // const googleLogin = async (googleToken) => {
  //   try {
  //     // Send Google token to backend for verification and user creation/login
  //     const { data } = await axios.post('/api/auth/google', { token: googleToken })
      
  //     if (data.success) {
  //       // Store auth data
  //       localStorage.setItem('authToken', data.token)
  //       localStorage.setItem('userData', JSON.stringify(data.user))
        
  //       setUser(data.user)
  //       setIsAuthenticated(true)
        
  //       return { 
  //         success: true, 
  //         user: data.user, 
  //         isNewUser: data.isNewUser // Backend tells us if account was just created
  //       }
  //     } else {
  //       return { success: false, error: data.message || 'Google login failed' }
  //     }
  //   } catch (error) {
  //     console.error('Google login error:', error)
  //     return { success: false, error: error.response?.data?.message || 'Network error. Please try again.' }
  //   }
  // }

  const handleGoogleSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google`
  }

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    signup,
    handleGoogleSignup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
