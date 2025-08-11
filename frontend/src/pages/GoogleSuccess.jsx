import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { set_profile } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
 
    if (set_profile(token)) {
      window.history.replaceState({}, document.title, "/");
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p className="w-full h-screen flex items-center justify-center font-mono">Signing you in via Google...</p>;
}
