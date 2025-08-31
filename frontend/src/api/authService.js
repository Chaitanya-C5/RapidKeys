import axiosClient from "./api.js";

// LOGIN
export const loginRequest = (email, password) => {
  return axiosClient.post("/login", { email, password });
};

// SIGNUP
export const signupRequest = (userData) => {
  return axiosClient.post("/signup", userData);
};

// GOOGLE LOGIN/SIGNUP CALLBACK
export const get_profile = (token) => {
  return axiosClient.get("/profile", { headers: { Authorization: `Bearer ${token}` } });
};

export const updateUserStats = async (statsData) => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await axiosClient.post('/update-stats', statsData, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    console.error('Error updating user stats:', error)
    throw error
  }
}

export const getLeaderboard = async (limit = 50) => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await axiosClient.get(`/leaderboard?limit=${limit}`, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}

// FORGOT PASSWORD
export const forgotPasswordRequest = async (email) => {
  try {
    const response = await axiosClient.post('/forgot-password', { email })
    return response.data
  } catch (error) {
    console.error('Error requesting password reset:', error)
    throw error
  }
}

export const verifyResetCode = async (email, code) => {
  try {
    const response = await axiosClient.post('/verify-reset-code', { email, code })
    return response.data
  } catch (error) {
    console.error('Error verifying reset code:', error)
    throw error
  }
}

export const resetPassword = async (email, code, new_password) => {
  try {
    const response = await axiosClient.post('/reset-password', { email, code, new_password })
    return response.data
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

export const checkUsername = async (username) => {
  try {
    const response = await axiosClient.post(`/check-username`, { username })
    return response.data
  } catch (error) {
    console.error('Error checking username:', error)
    throw error
  }
}

export const updateUsername = async (token, username) => {
  try { 
    console.log("Updating username...", username)
    const response = await axiosClient.post(`/update-username`, { username }, { headers: { Authorization: `Bearer ${token}` } })
    return response.data
  } catch (error) {
    console.error('Error updating username:', error)
    throw error
  }
}