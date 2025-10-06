import { useState } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        {isLogin ? (
          <Login onLogin={onLogin} onToggle={() => setIsLogin(false)} />
        ) : (
          <Signup onToggle={() => setIsLogin(true)} onLogin={onLogin} />
        )}
      </div>
    </div>
  );
}
