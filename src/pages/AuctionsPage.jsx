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

  const [activeTab, setActiveTab] = useState("open");
  const [openAuctions, setOpenAuctions] = useState([]);
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [quantityInputs, setQuantityInputs] = useState({});

  // Offers de subastas publicadas por OTROS grupos
  const fetchOpenAuctions = useCallback(async () => {
    if (!token) return setOpenAuctions([]);

    try {
      const res = await axios.get(`${API}/auctions/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenAuctions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching auction offers:", err?.response?.data || err.message);
    }
  }, [API, token]);

  // Proposals que OTROS grupos han hecho hacia nuestras offers
  const fetchPendingAuctions = useCallback(async () => {
    if (!token) return setPendingAuctions([]);

    try {
      const res = await axios.get(`${API}/auctions/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAuctions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching auction proposals:", err?.response?.data || err.message);
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

    const payload = {
      auction_id: item.auction_id,
      proposal_id: item.proposal_id,
      url: item.url,
      timestamp: new Date().toISOString(),
      quantity,
      group_id: item.group_id,
      operation: "acceptance",
    };

    try {
      await axios.post(`${API}/auctions/offers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Oferta realizada");
      fetchOpenAuctions();
    } catch (err) {
      console.error("Error placing offer:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Error al realizar la oferta");
    }
  };

  const handleDecideOffer = async (item, operation) => {
    if (!token) {
      alert("Debes iniciar sesión");
      return;
    }

    const payload = {
      auction_id: item.auction_id,
      proposal_id: item.proposal_id,
      operation,
    };

    try {
      await axios.post(`${API}/auctions/decide`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Oferta ${operation === "acceptance" ? "aceptada" : "rechazada"}`);
      fetchPendingAuctions();
    } catch (err) {
      console.error("Error deciding offer:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Error al procesar la decisión");
    }
  };

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
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setActiveTab("open"); fetchOpenAuctions(); }}>Subastas Abiertas</button>
        <button onClick={() => { setActiveTab("pending"); fetchPendingAuctions(); }} style={{ marginLeft: 8 }}>Subastas Pendientes</button>
      </div>

      {activeTab === "open" && (
        <div>
          {openAuctions.length === 0 ? (
            <p>No hay subastas abiertas.</p>
          ) : (
            openAuctions.map((it) => (
              <div key={it.auction_id} style={{ padding: 8, border: "1px solid #eee", marginTop: 8 }}>
                <div>auction_id: {it.auction_id}</div>
                <div>proposal_id: {it.proposal_id}</div>
                <div>url: {it.url}</div>
                <div>timestamp: {it.timestamp}</div>
                <div>quantity: {it.quantity}</div>
                <div>group_id: {it.group_id}</div>
                <div>operation: {it.operation}</div>
                <div style={{ marginTop: 6 }}>
                  <input
                    type="number"
                    placeholder="quantity"
                    value={quantityInputs[it.auction_id] ?? ""}
                    onChange={(e) => setQuantityInputs((s) => ({ ...s, [it.auction_id]: e.target.value }))}
                  />
                  <button onClick={() => handlePlaceOffer(it)} style={{ marginLeft: 8 }}>Realizar oferta</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <div>
          {pendingAuctions.length === 0 ? (
            <p>No hay subastas pendientes.</p>
          ) : (
            pendingAuctions.map((it) => (
              <div key={it.auction_id} style={{ padding: 8, border: "1px solid #eee", marginTop: 8 }}>
                <div>auction_id: {it.auction_id}</div>
                <div>proposal_id: {it.proposal_id}</div>
                <div>url: {it.url}</div>
                <div>timestamp: {it.timestamp}</div>
                <div>quantity: {it.quantity}</div>
                <div>group_id: {it.group_id}</div>
                <div>operation: {it.operation}</div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => handleDecideOffer(it, "acceptance")}>Aceptar oferta</button>
                  <button onClick={() => handleDecideOffer(it, "rejection")} style={{ marginLeft: 8 }}>Rechazar oferta</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/">← Volver</Link>
      </div>
    </div>
  );
}
