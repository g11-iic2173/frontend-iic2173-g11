import { useState } from "react";
import axios from "axios";

export default function Login({ onLogin, onToggle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_AUTH_URL}/login`, {
        email,
        password
      });

      localStorage.setItem("token", res.data.access_token);
      onLogin();
    } catch (err) {
      alert(err.response?.data?.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="AuthBox">
      <h2>INICIAR SESIÓN</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      <p onClick={onToggle} >
        ¿No tienes cuenta? Registrarse
      </p>
    </div>
  );
}
