import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  signupRequest,
  get_profile,
} from "../api/authService.js";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const setAuthData = (token, user) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    try {
      const { data } = await loginRequest(email, password);
      if (data.success) {
        setAuthData(data.token, data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (error) {
      return {
        success: false,
        error:
          error.response.error|| "Network error. Please try again.",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await signupRequest(userData);
      if (data.success) {
        setAuthData(data.token, data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Signup failed" };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Network error. Please try again.",
      };
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google`;
  };

  // Called after Google redirects back to frontend
  const set_profile = async (token) => {
    try {
      const { data } = await get_profile(token);
      if (data.success) {
        setAuthData(data.token, data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Google login failed" };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Network error. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        signup,
        handleGoogleSignup,
        set_profile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
