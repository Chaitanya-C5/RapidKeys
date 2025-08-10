import axios from 'axios' 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

const axiosClient = axios.create({
    baseURL: BACKEND_BASE_URL, 
    withCredentials: true, 
  });
  
export default axiosClient;