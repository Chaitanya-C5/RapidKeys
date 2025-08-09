import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      window.history.replaceState({}, document.title, "/");
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Signing you in via Google...</p>;
}
