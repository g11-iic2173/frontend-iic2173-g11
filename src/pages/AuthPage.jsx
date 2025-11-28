import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";

export default function AuthPage() {
  
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    if (data.role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {isLogin ? (
          <Login onLogin={handleLogin} onToggle={() => setIsLogin(false)} />
        ) : (
          <Signup onLogin={handleLogin} onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
