import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

export default function AuctionsPage() {
  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";
  const token = localStorage.getItem("token");

  let userRole = null;
  try {
    userRole = token ? jwtDecode(token).role : null;
  } catch {
    userRole = null;
  }

  const [openAuctions, setOpenAuctions] = useState([]);
  const [quantityInputs, setQuantityInputs] = useState({});

  // Offers de subastas publicadas por OTROS grupos
  const fetchOpenAuctions = useCallback(async () => {
    if (!token) return setOpenAuctions([]);

    try {
      const res = await axios.get(`${API}/auctions/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = Array.isArray(res.data) ? res.data : [];

      // Transform: replace the top-level event.id with the property's name
      const transformed = items.map((it) => {
        const event = it.event ? { ...it.event } : {};
        const property = it.property ? { ...it.property } : {};

        if (property.name) {
          event.id = property.name; // replace numeric id with property name
        }

        return { event, property };
      });

      setOpenAuctions(transformed);
    } catch (err) {
      console.error("Error fetching auction offers:", err?.response?.data || err.message);
    }
  }, [API, token]);


  const handlePlaceOffer = async (item) => {
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }

    const quantity = Number(quantityInputs[item.auction_id] ?? item.quantity ?? 1);
    if (!quantity || quantity <= 0) {
      alert("Ingrese una cantidad válida");
      return;
    }
    if (quantity < (item.quantity || 0)) {
      alert("El monto ofrecido es menor al establecido por el subastador");
      return;
    }

    const payload = {
      auction_id: item.auction_id,
      url: item.url,
      quantity,
    };

    try {
      await axios.post(`${API}/auctions/proposals`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Oferta realizada");
      fetchOpenAuctions();
    } catch (err) {
      console.error("Error placing offer:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Error al realizar la oferta");
    }
  };

  // normalize auction fields helper
  const normalizeAuction = (item) => {
    // Support multiple shapes: { event, property } (from /auctions/offers)
    // or flat { raw, auction_id, ... }.
    const event = item?.event || {};
    const property = item?.property || {};
    const raw = event.raw || item.raw || property.raw || {};

    const auction_id = event.id ?? item.auction_id ?? raw.auction_id ?? raw.id ?? property.id;
    const proposal_id = item.proposal_id ?? raw.proposal_id;
    const url = raw.img ?? property.img ?? item.img;
    const timestamp = event.timestamp ?? item.timestamp ?? property.timestamp;
    const quantity = raw.quantity ?? item.quantity ?? property.offers ?? 0;
    const group_id = event.group_id ?? item.group_id ?? property.group_id;
    const operation = event.operation ?? item.operation ?? raw.operation;

    let formattedTimestamp = null;
    try {
      formattedTimestamp = timestamp ? new Date(timestamp).toLocaleString() : null;
    } catch {
      formattedTimestamp = timestamp;
    }

    return {
      auction_id,
      proposal_id,
      url,
      timestamp,
      formattedTimestamp,
      quantity,
      group_id,
      operation,
      raw: { ...raw, property_img: property.img, property_name: property.name, property_id: property.id },
    };
  };

  // (decide offer was removed from this page — handled in the dedicated Admin auctions area)

  useEffect(() => {
    if (userRole === "admin") fetchOpenAuctions();
  }, [userRole, fetchOpenAuctions]);

  if (userRole !== "admin") {
    return (
      <div style={{ padding: 16 }}>
        <h2>Subastas</h2>
        <p>Acceso denegado. Se requiere rol admin.</p>
        <Link to="/">Volver</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Subastas (Admin)</h2>

      <div style={{ marginTop: 12 }}>
        {openAuctions.length === 0 ? (
          <p>No hay subastas abiertas.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {openAuctions.map((itRaw) => {
              const it = normalizeAuction(itRaw);
              const aid = it.auction_id;
              return (
                <div key={aid || Math.random()} style={{ background: "#fff", color: "#000", border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                    {(() => {
                      const imageSrc = it.raw?.property_img ?? it.url;
                      if (!imageSrc) return null;
                      return (
                        <div style={{ height: 140, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
                          <img src={imageSrc} alt="preview" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "cover" }} />
                        </div>
                      );
                    })()}

                  <div style={{ fontSize: 13, color: "#222", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>ID: {aid}</div>
                    <div style={{ fontSize: 12, color: "#333" }}>Grupo: {String(it.group_id)}</div>
                    <div style={{ fontSize: 12, color: "#333" }}>Cantidad: {String(it.quantity)}</div>
                    <div style={{ fontSize: 12, color: "#333" }}>Timestamp: {it.formattedTimestamp ?? it.timestamp}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      placeholder="cantidad"
                      value={quantityInputs[aid] ?? ""}
                      onChange={(e) => setQuantityInputs((s) => ({ ...s, [aid]: e.target.value }))}
                      style={{ flex: 1, padding: 6, border: "1px solid #ccc", borderRadius: 6 }}
                    />
                    <button onClick={() => handlePlaceOffer(it)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #000", background: "#000", color: "#fff" }}>Oferta</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/">← Volver</Link>
      </div>
    </div>
  );
}
