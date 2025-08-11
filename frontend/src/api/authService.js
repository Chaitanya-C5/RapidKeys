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
