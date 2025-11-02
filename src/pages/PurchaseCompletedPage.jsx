import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PurchaseCompletedPage() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  useEffect(() => {
    const qp = new URLSearchParams(search);
    const token_ws = qp.get("token_ws");
    const property_id = qp.get("property_id");
    const request_id = qp.get("request_id");

    if (!token_ws || !property_id) {
      setError("Compra anulada por el Usuario.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const headers = getAuthHeaders();
        const body = request_id ? { token_ws, property_id, request_id } : { token_ws, property_id };
        const res = await axios.post(`${API}/purchases/commit`, body, { headers });
        setResult(res.data || null);
      } catch (e) {
        console.error("commit error:", e?.response?.data || e.message || e);
        setError(e?.response?.data?.error || "Pago Rechazado por Transbank");
      } finally {
        setLoading(false);
      }
    })();
  }, [search, API]);

  if (loading) return <p style={{ padding: 16 }}>Confirmando compra…</p>;

  if (error)
    return (
      <div style={{ padding: 16 }}>
        <h2>Resultado de compra</h2>
        <p style={{ color: "red" }}>{error}</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate("/")}>Volver</button>
        </div>
      </div>
    );

  if (!result)
    return (
      <div style={{ padding: 16 }}>
        <h2>Resultado de compra</h2>
        <p>No se recibió respuesta del servidor.</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate("/")}>Volver</button>
        </div>
      </div>
    );

  const { property_url, message, property_name } = result || {};

  return (
    <div style={{ padding: 16 }}>
      <h2>Compra confirmada</h2>
      <p style={{ marginTop: 8 }}>{message || "Operación procesada"}</p>
      <p style={{ marginTop: 8 }}>
        <strong>Propiedad:</strong> {property_name || "-"}
      </p>
      <p>
        <strong>Enlace:</strong>{" "}
        {property_url ? (
          <a href={property_url} target="_blank" rel="noreferrer">
            Ver propiedad
          </a>
        ) : (
          "-"
        )}
      </p>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/my-visits")}>Ir a mis visitas</button>
        <button onClick={() => navigate("/")} style={{ marginLeft: 8 }}>
          Volver
        </button>
      </div>
    </div>
  );
}
