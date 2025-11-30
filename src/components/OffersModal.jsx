import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function OffersModal({ open, onClose, propertyUrl }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyName, setPropertyName] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";
  const token = localStorage.getItem("token");

  const normalize = (it) => {
    const event = it.event || {};
    const property = it.property || {};
    const raw = event.raw || it.raw || {};

    return {
      auction_id: event.id ?? it.auction_id ?? raw.auction_id ?? raw.id,
      event_id: event.id ?? null,
      proposal_id: it.proposal_id ?? raw.proposal_id,
      group_id: event.group_id ?? it.group_id ?? raw.group_id,
      quantity: raw.quantity ?? it.quantity ?? 0,
      timestamp: event.timestamp ?? it.timestamp ?? property.timestamp,
      raw,
      property_name: property.name ?? raw.property_name ?? null,
    };
  };

  const fetchOffers = useCallback(async () => {
    if (!open || !propertyUrl) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API}/auctions/proposals-url`, {
        params: { property_url: propertyUrl },
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = Array.isArray(res.data) ? res.data : [];
      const normalized = items.map(normalize);
      setOffers(normalized);

      // pick property name from response if available
      const first = items[0];
      const pname = first?.property?.name ?? first?.event?.raw?.property_name ?? null;
      setPropertyName(pname);
    } catch (err) {
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [API, open, propertyUrl, token]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const decideOffer = async (offer, operation) => {
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }

    const eventId = offer.event_id ?? offer.auction_id ?? offer.proposal_id;
    if (!eventId) {
      console.error("No event id available for offer", offer);
      alert("No se pudo procesar la oferta (id faltante)");
      return;
    }

    const action = operation === "acceptance" ? "accept" : "reject";

    try {
      await axios.post(`${API}/auctions/proposals/${eventId}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Oferta ${action === "accept" ? "aceptada" : "rechazada"}`);
      fetchOffers();
    } catch (err) {
      console.error(`Error calling proposals/${eventId}/${action}:`, err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Error al procesar la decisión");
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 999 }}
      />

      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: 720,
          background: "white",
          zIndex: 1000,
          borderRadius: 8,
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Ofertas {propertyName ? `- ${propertyName}` : "para la propiedad"}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20 }}>✕</button>
        </div>

        {loading ? (
          <p>Cargando ofertas…</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {String(error)}</p>
        ) : offers.length === 0 ? (
          <p>No hay ofertas para esta propiedad.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th style={{ padding: 8 }}>Grupo</th>
                <th style={{ padding: 8 }}>Cantidad</th>
                <th style={{ padding: 8 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.proposal_id ?? o.auction_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 8 }}>{String(o.group_id ?? "-")}</td>
                  <td style={{ padding: 8 }}>{String(o.quantity ?? "-")}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => decideOffer(o, "acceptance")} style={{ marginRight: 8 }}>Aceptar</button>
                    <button onClick={() => decideOffer(o, "rejection")} style={{ marginLeft: 8 }}>Rechazar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
