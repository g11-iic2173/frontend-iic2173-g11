import { useState } from "react";
import axios from "axios";

export default function Signup({ onLogin, onToggle }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const AUTH_URL = import.meta.env.VITE_AUTH_URL || "https://api.propiedadesarquisis.me/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${AUTH_URL}/signup`, {
        email,
        password,
        username,
      });
      onLogin(res.data);

    } catch (err) {
      alert(err.response?.data?.error || "Error al registrarse");
    }
  };

  return (
    <div className="AuthBox">
      <h2>REGISTRARSE</h2>

      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Correo:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Crear cuenta</button>
      </form>
      <p onClick={onToggle} style={{ cursor: "pointer", marginTop: "1rem" }}>
        ¿Ya tienes cuenta? Iniciar sesión
      </p>
    </div>
  );
}
