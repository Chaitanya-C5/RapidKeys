import axios from 'axios' 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

const axiosClient = axios.create({
    baseURL: BACKEND_BASE_URL, 
    withCredentials: true, 
});

// Add auth token to requests
axiosClient.interceptors.request.use((config) => {
  const userData = localStorage.getItem('userData')
  if (userData) {
    const { token } = JSON.parse(userData)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default axiosClient;