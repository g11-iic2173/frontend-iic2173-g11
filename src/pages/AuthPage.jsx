import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [deployVersion, setDeployVersion] = useState(null);
  const navigate = useNavigate();

  /*endpoint para la versión de deploy*/
  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await axios.get(`${API}/version`);
        if (res.data?.version) {
          setDeployVersion(res.data.version);
        }
      } catch (err) {
        console.warn("No se pudo obtener la versión del deploy:", err.response?.data || err.message);
      }
    };

    fetchVersion();
  }, [API]);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    // if (data.role === "admin") navigate("/admin");
    // else navigate("/");
    navigate("/");
  };

  return (
    <div className="auth-container" style={{ position: "relative" }}>
      {deployVersion && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 16,
            fontSize: 12,
            color: "#666",
          }}
        >
          Versión: <strong>{deployVersion}</strong>
        </div>
      )}
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
