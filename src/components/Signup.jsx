import { useState } from "react";
import axios from "axios";

export default function Signup({ onLogin, onToggle }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const AUTH_URL = import.meta.env.VITE_AUTH_URL || "https://api.propiedadesarquisis.me/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${AUTH_URL}/signup`, {
        email,
        password,
        username,
        role,
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

        <div style={{ margin: "8px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Tipo de cuenta:</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setRole("user")}
              aria-pressed={role === "user"}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: role === "user" ? "2px solid #0ea5e9" : "1px solid #ccc",
                background: role === "user" ? "#e0f2fe" : "white",
                cursor: "pointer",
              }}
            >
              Usuario
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              aria-pressed={role === "admin"}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: role === "admin" ? "2px solid #f97316" : "1px solid #ccc",
                background: role === "admin" ? "#fff7ed" : "white",
                cursor: "pointer",
              }}
            >
              Admin
            </button>
          </div>
        </div>

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
