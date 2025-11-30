import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import PurchaseDetailModal from "../components/PurchaseDetailModal";

export default function ReservedVisitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const th = { padding: 8, border: "1px solid #ddd" };

  const API =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.propiedadesarquisis.me/api";

  const token = localStorage.getItem("token");

  const userRole = (() => {
    try {
      return token ? jwtDecode(token).role : null;
    } catch {
      return null;
    }
  })();

  const pollRef = useRef(null);

  const fetchPurchases = useCallback(async () => {
    if (!token) {
      setLoading(false);
      alert("Debes iniciar sesión");
      return [];
    }

    try {
      const res = await axios.get(`${API}/purchases/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      return data;
    } catch (e) {
      console.error(
        "Error cargando purchases admin:",
        e?.response?.data || e.message
      );

      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        alert("Tu sesión expiró. Inicia sesión nuevamente.");
      } else {
        alert("No se pudieron cargar las visitas reservadas.");
      }

      return [];
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;

    pollRef.current = setInterval(async () => {
      const data = await fetchPurchases();
      const pendingLeft = (data || []).some(
        (p) => String(p.status).toLowerCase() === "pending"
      );

      if (!pendingLeft) stopPolling();
    }, 5000);
  }, [fetchPurchases]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

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
  }, [fetchPurchases, startPolling]);



  if (loading) return <p>Cargando…</p>;

  if (!items.length)
    return (
      <div style={{ padding: 16 }}>
        <h2>Visitas reservadas (Admin)</h2>
        <p>No existen reservas aún.</p>
        <Link to="/">
          <button>Volver</button>
        </Link>
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <h2>Visitas reservadas</h2>

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
            <th style={th}>Fecha</th>
            <th style={th}>Propiedad</th>
            <th style={th}>Precio propiedad</th>
            <th style={th}>Precio agendamiento</th>

            {userRole === "admin" && (
              <>
                <th style={th}>Nuevo monto</th>
                <th style={th}>Detalle</th>
                <th style={th}>Subasta</th>
              </>
            )}

            {userRole !== "admin" && <th style={th}>Comprar</th>}
          </tr>
        </thead>

        <tbody>
          {items.map((p) => {
            const schedulePrice = p.custom_price_amount
              ? Number(p.custom_price_amount)
              : Number(p.price_amount) * 0.1;

            return (
              <tr key={p.id}>
                <td style={th}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                </td>

                <td style={th}>
                  {p.propertie ? (
                    <Link to={`/properties/${p.propertie.id}`}>
                      <strong>{p.propertie.name}</strong>
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>

                <td style={th}>
                  {Number(p.price_amount).toLocaleString("es-CL")}{" "}
                  {p.price_currency}
                </td>

                <td style={th}>
                  {schedulePrice.toLocaleString("es-CL")} {p.price_currency}
                </td>

                {userRole === "admin" && (
                  <td style={th}>
                    <input
                      type="number"
                      defaultValue={schedulePrice}
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                      onBlur={async (e) => {
                        const newAmount = Number(e.target.value);

                        if (!newAmount || newAmount <= 0) {
                          alert("Monto inválido");
                          return;
                        }

                        try {
                          await axios.patch(
                            `${API}/purchases/purchase-intents/${p.id}/price`,
                            { newPrice: newAmount },
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );

                          alert("Precio actualizado");
                          fetchPurchases();
                        } catch (err) {
                          console.error(err);
                          alert(
                            err.response?.data?.error ||
                              "Error al actualizar el precio"
                          );
                        }
                      }}
                    />
                  </td>
                )}

                {userRole === "admin" && (
                  <td style={th}>
                    <button onClick={() => setSelectedPurchase(p)}>
                      Ver más
                    </button>
                  </td>
                )}

                {userRole === "admin" && (
                  <td style={th}>
                    <button
                      onClick={() =>
                        console.log("Subasta aún no implementada")
                      }
                    >
                      Subasta
                    </button>
                  </td>
                )}

                {userRole !== "admin" && (
                  <td style={th}>
                    <button
                      onClick={() => {
                        window.location.href = `/confirm-admin-sale/${p.id}`;
                      }}
                    >
                      Comprar
                    </button>
                  </td>
                )}
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
