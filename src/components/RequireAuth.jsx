import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth" replace />;

  // Revisamos que el token no haya expirado
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload));
    if (exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/auth" replace />;
    }
  } catch (e) {console.log(e)}

  return children;
}
