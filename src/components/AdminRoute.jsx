import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
        state={{ error: "Acceso permitido solo para administradores" }}
      />
    );
  }

  return children;
}
