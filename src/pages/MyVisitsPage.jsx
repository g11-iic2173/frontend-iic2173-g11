import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PurchaseDetailModal from "../components/PurchaseDetailModal";
import PropertyDetailPage from "./PropertyDetailPage";

export default function MyVisitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null); 

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const pollRef = useRef(null);

  // --- función para cargar compras del usuario
  const fetchPurchases = async () => {
    if (!token) {
      setLoading(false);
      alert("Debes iniciar sesión para ver tus visitas");
      return;
    }
    try {
      const res = await axios.get(`${API}/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      return data;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        alert("Tu sesión expiró. Inicia sesión nuevamente.");
      } else {
        console.error("Error cargando purchases:", e?.response?.data || e.message);
        alert(e?.response?.data?.error || "No se pudieron cargar tus visitas");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  // --- arranque inicial + foco de ventana
  useEffect(() => {
    fetchPurchases().then((data) => {
      const hasPending = (data || []).some(
        (p) => String(p.status).toLowerCase() === "pending"
      );
      if (hasPending) startPolling();
    });

    const onFocus = () => fetchPurchases();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      stopPolling();
    };
  }, [API, token]);

  // --- iniciar/detener polling
  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const data = await fetchPurchases();
      const pendingLeft = (data || []).some(
        (p) => String(p.status).toLowerCase() === "pending"
      );
      if (!pendingLeft) stopPolling();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  if (loading) return <p>Cargando…</p>;

  if (!items.length)
    return (
      <div style={{ padding: 16 }}>
        <h2>Mis visitas</h2>
        <p>No tienes compras/visitas aún.</p>
        <Link to="/">
          <button>Volver a propiedades</button>
        </Link>
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <h2>Mis visitas agendadas</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/">
          <button>← Volver a propiedades</button>
        </Link>
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: 12,
        }}
      >
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Fecha</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Propiedad</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Monto (10%)</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Estado</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Código de reserva</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Detalle de compra</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const statusStr = String(p.status).toUpperCase();
            let color = "orange";
            if (statusStr === "ACCEPTED") color = "green";
            else if (statusStr === "REJECTED") color = "red";

            return (
              <tr key={p.id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {p.propertie ? (
                    <Link to={`/properties/${p.propertie.id}`}>
                      <strong>{p.propertie.name}</strong>
                    </Link>
                  ) : "-"}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {p.price_amount} {p.price_currency}
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ddd",
                    color,
                    fontWeight: "bold",
                  }}
                >
                  {statusStr}
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ddd",
                    fontFamily: "monospace",
                  }}
                >
                  {p.request_id ? p.request_id.slice(0, 8) : "-"}
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => setSelectedPurchase(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#007bff",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Ver más
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedPurchase && (
        <PurchaseDetailModal
          open={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          purchaseData={selectedPurchase}
        />
      )}
    </div>
  );
}
