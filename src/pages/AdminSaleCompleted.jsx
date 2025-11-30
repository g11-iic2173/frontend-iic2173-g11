import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminSaleCompleted() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token_ws = params.get("token_ws");
  const purchase_intent_id = params.get("purchase_intent_id");
  const buyer_email = params.get("buyer_email"); 

  const [message, setMessage] = useState("Procesando la compra…");

  const API =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.propiedadesarquisis.me/api";

  useEffect(() => {
    const confirmResale = async () => {
      if (!token_ws || !purchase_intent_id) {
        setMessage("Faltan parámetros para confirmar la compra.");
        return;
      }

      if (!buyer_email) {
        setMessage("No se encontró el email del comprador.");
        return;
      }

      try {
        const res = await axios.post(
          `${API}/purchases/commit-resell`,
          { token_ws, purchase_intent_id, buyer_email },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("Reventa confirmada:", res.data);
        setMessage("Compra realizada con éxito (Reventa)");
      } catch (err) {
        console.error("Error confirmando reventa:", err);
        setMessage(
          err.response?.data?.error || "Error al confirmar la reventa"
        );
      }
    };

    confirmResale();
  }, [API, token_ws, purchase_intent_id, buyer_email]);

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>Resultado de compra (Reventa)</h1>
      <p style={{ marginTop: 16, fontSize: 18 }}>{message}</p>

      <button
        style={{
          marginTop: 24,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        Volver al inicio
      </button>
    </div>
  );
}
