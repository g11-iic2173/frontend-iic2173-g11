import { jwtDecode } from "jwt-decode";

export default function AdminPage({ onLogout }) {
  const token = localStorage.getItem("token");
  let username = "Administrador";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.email || decoded.mail || "Administrador";
    } catch {
      username = "Administrador";
    }
  }

  return (
    <div>
      <button onClick={onLogout}>Cerrar sesión</button>

      <h1>Bienvenido Administrador</h1>
      <h2>{username}</h2>
      <p>Acceso exclusivo para administradores.</p>
    </div>
  );
}
