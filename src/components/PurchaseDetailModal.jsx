import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PurchaseDetailModal({ open, onClose, purchaseData }) {
  const [purchase, setPurchase] = useState(purchaseData || null);
  const [loading, setLoading] = useState(!purchaseData);
  const [error, setError] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";

  useEffect(() => {
    if (purchaseData) return;
    const fetchPurchase = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/purchases/${purchaseData?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar la compra");
        const data = await res.json();
        setPurchase(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [purchaseData]);

  if (!open) return null;

  // estado
  const statusStr = purchase ? String(purchase.status).toUpperCase() : "";
  let color = "orange";
  let statusEs = "Pendiente";

  if (statusStr === "ACCEPTED" || statusStr === "APPROVED") {
    color = "green";
    statusEs = "Aceptado";
  } else if (statusStr === "REJECTED") {
    color = "red";
    statusEs = "Rechazado";
  } else if (statusStr === "PENDING") {
    color = "orange";
    statusEs = "Pendiente";
  } else if (statusStr === "ERROR") {
    color = "gray";
    statusEs = "Error";
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 999,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "40%",
          maxWidth: 600,
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-6px 0 15px rgba(0,0,0,0.25)",
          zIndex: 1000,
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "0.75rem 1.5rem 1.5rem 1.5rem" }}>
          {loading ? (
            <p>Cargando detalle...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <>
              {/* Datos de la propiedad */}
              <h2 style={{ margin: "0 0 12px 0" }}>Propiedad</h2>
              {purchase.propertie ? (
                <div>
                  {purchase.propertie.img && (
                    <img
                      src={purchase.propertie.img}
                      alt={purchase.propertie.name}
                      style={{
                        width: "80%",
                        maxWidth: 320,
                        borderRadius: 8,
                        margin: "0 auto 12px",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    <Link
                      to={`/properties/${purchase.propertie.id}`}
                      style={{
                        color: "#007bff",
                        textDecoration: "none",
                      }}
                      onClick={onClose}
                    >
                      {purchase.propertie.name}
                    </Link>
                  </p>

                  <p style={{ color: "#555" }}>{purchase.propertie.location}</p>

                  <p style={{ marginTop: 10 }}>
                    <strong>Precio total:</strong>{" "}
                    {purchase.propertie.price} {purchase.propertie.currency}
                  </p>
                  <p>
                    <strong>Precio agendamiento (10%):</strong>{" "}
                    {purchase.price_amount} {purchase.price_currency}
                  </p>
                </div>
              ) : (
                <p>Sin información de la propiedad</p>
              )}

              <h2>Detalle de compra</h2>
              <div>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(purchase.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Monto pagado:</strong>{" "}
                  {purchase.price_amount} {purchase.price_currency}
                </p>
                <p>
                  <strong>Código de reserva:</strong>{" "}
                  <code>{purchase.request_id}</code>
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span style={{ color, fontWeight: "bold" }}>{statusEs}</span>
                </p>
              </div>

              {/* 📄 Descargar boleta */}
              {(statusStr === "ACCEPTED" || statusStr === "APPROVED") && (
                <div style={{ marginTop: 16 }}>
                  {purchase.receipt_url ? (
                    <button
                      onClick={() => window.open(purchase.receipt_url, "_blank")}
                      style={{
                        backgroundColor: "#28a745",
                        color: "#fff",
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      📄 Ver boleta PDF
                    </button>
                  ) : (
                    <p style={{ color: "#555" }}>
                      La boleta aún no está disponible.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
