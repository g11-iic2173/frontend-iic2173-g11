import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyVisitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE; 
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const pollRef = useRef(null);   // guarda el id del setInterval
  const isMounted = useRef(false);

  // --- función para cargar compras del usuario
  const fetchPurchases = async () => {
    if (!token) {
      setLoading(false);
      alert("Debes iniciar sesión para ver tus visitas");
      // navigate("/login"); // descomenta si quieres redirigir
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
        // navigate("/login"); // descomenta si quieres redirigir
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
    isMounted.current = true;

    // carga inicial
    fetchPurchases().then((data) => {
      // si hay pendientes, inicia polling
      const hasPending = (data || []).some((p) => String(p.status).toLowerCase() === "pending");
      if (hasPending) startPolling();
    });

    // refresca al volver a la pestaña (útil si estuvo mucho rato abierta)
    const onFocus = () => fetchPurchases();
    window.addEventListener("focus", onFocus);

    return () => {
      isMounted.current = false;
      window.removeEventListener("focus", onFocus);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, token]);

  // --- iniciar/detener polling
  const startPolling = () => {
    if (pollRef.current) return; // ya corriendo
    pollRef.current = setInterval(async () => {
      const data = await fetchPurchases();
      const pendingLeft = (data || []).some((p) => String(p.status).toLowerCase() === "pending");
      if (!pendingLeft) {
        stopPolling();
      }
    }, 5000); // cada 5 segundos
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
        <Link to="/"><button>Volver a propiedades</button></Link>
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <h2>Mis visitas agendadas</h2>

      {/* Botón volver */}
      <div style={{ marginBottom: 12 }}>
        <Link to="/"><button>← Volver a propiedades</button></Link>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Fecha</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Propiedad</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Monto (10%)</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Estado</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Código de reserva</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
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
                  color:
                    String(p.status).toUpperCase() === "APPROVED"
                      ? "green"
                      : String(p.status).toUpperCase() === "REJECTED"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                }}
              >
                {String(p.status).toUpperCase()}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd", fontFamily: "monospace" }}>
                {p.request_id ? p.request_id.slice(0, 8) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
