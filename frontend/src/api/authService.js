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
