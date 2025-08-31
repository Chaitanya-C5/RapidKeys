import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { get_profile } from "../api/authService";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { set_profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        console.log("Token:", token);

        localStorage.setItem("authToken", token);

        if (!token) {
          throw new Error("No token provided");
        }

        const response = await get_profile(token);
        const profile = response.data;  
        
        console.log("Profile data:", profile);
        
        if (profile && profile.success && profile.user.username === null) {
          console.log("Username is null");
          navigate("/set-username");
        } else if (set_profile(token)) {
          window.history.replaceState({}, document.title, "/");
          navigate("/");
        } else {
          throw new Error("Failed to set user session");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message || "An error occurred during authentication");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return null;
}
