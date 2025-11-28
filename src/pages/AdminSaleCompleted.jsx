import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminSaleCompleted() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token_ws = params.get("token_ws");
  const purchase_intent_id = params.get("purchase_intent_id");

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";
  const token = localStorage.getItem("token");

  const [message, setMessage] = useState("Procesando la compra…");

  useEffect(() => {
    const confirmResale = async () => {
      if (!token_ws || !purchase_intent_id) {
        setMessage("Faltan parámetros para confirmar la compra.");
        return;
      }

      try {
        const res = await axios.post(
          `${API}/purchases/commit-resell`,
          { token_ws, purchase_intent_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Compra realizada con éxito (Reventa)");
        console.log("Reventa confirmada:", res.data);

      } catch (err) {
        console.error("Error confirmando reventa:", err);
        setMessage(err.response?.data?.error || "Error al confirmar la reventa");
      }
    };

    confirmResale();
  }, [API, token, token_ws, purchase_intent_id]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Resultado de compra (Reventa)</h1>

      <p>{message}</p>

      <button
        onClick={() => navigate("/")}
      >
        Volver al inicio
      </button>
    </div>
  );
}
