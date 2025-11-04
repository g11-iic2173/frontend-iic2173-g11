import { useState } from "react";
import axios from "axios";

export default function Signup({ onToggle, onLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const AUTH_URL = import.meta.env.VITE_AUTH_URL || "https://api.propiedadesarquisis.me/auth";


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${AUTH_URL}/signup`, {
        email,
        username,
        password
      });

      localStorage.setItem("token", res.data.access_token);

      onLogin();
    } catch (err) {
      console.error("Error en /signup:", err);
      alert(err.response?.data?.error || "Error al registrar usuario");
    }
  };

  return (
    <div className="AuthBox">
      <h2>REGISTRARSE</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Nombre de usuario:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Crear cuenta</button>
      </form>
      <p onClick={onToggle}>
        Ya tengo una cuenta
      </p>
    </div>
  );
}
