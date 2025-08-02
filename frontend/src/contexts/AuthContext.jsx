import { createContext, useContext, useState, useEffect } from 'react'

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
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Store auth data
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
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const signup = async (userData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Store auth data
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
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const googleLogin = async (googleToken) => {
    try {
      // Send Google token to backend for verification and user creation/login
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Store auth data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        setUser(data.user)
        setIsAuthenticated(true)
        
        return { 
          success: true, 
          user: data.user, 
          isNewUser: data.isNewUser // Backend tells us if account was just created
        }
      } else {
        return { success: false, error: data.message || 'Google login failed' }
      }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
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
    googleLogin,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
