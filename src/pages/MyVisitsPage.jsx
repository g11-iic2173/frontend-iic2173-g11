import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MyVisitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const backend = import.meta.env.VITE_API_BASE_URL;
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${backend}/purchases`, { headers: authHeader });
        setItems(res.data || []);
      } catch (e) {
        alert(e?.response?.data?.error || "No se pudieron cargar tus visitas");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
                {new Date(p.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {p.propertie ? (
                    <Link to={`/properties/${p.propertie.id}`}>
                    <strong>{p.propertie.name}</strong>
                    </Link>
                ) : (
                    "-"
                )}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {p.price_amount} {p.price_currency}
                </td>
                <td
                style={{
                    padding: 8,
                    border: "1px solid #ddd",
                    color:
                    p.status === "APPROVED"
                        ? "green"
                        : p.status === "REJECTED"
                        ? "red"
                        : "orange",
                    fontWeight: "bold",
                }}
                >
                {p.status}
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
