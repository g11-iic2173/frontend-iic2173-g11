import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState({ balance: 0 });
  const [recharge, setRecharge] = useState("");

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";

  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetchProperty = async () => {
    try {
      // ❗️ NO agregamos /api, ya viene en API
      const res = await axios.get(`${API}/properties/${id}`);
      setProperty(res.data);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.error || "Error cargando la propiedad");
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        setWallet({ balance: 0 });
        return;
      }
      // ❗️ OJO: sin "}" al final; agrego cache-buster para evitar caché
      const res = await axios.get(`${API}/wallet`, {
        headers,
        params: { _: Date.now() },
      });
      setWallet(res.data);
    } catch {
      setWallet({ balance: 0 });
    }
  };

  useEffect(() => {
    fetchProperty();
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p>{error}</p>;
  if (!property) return <p>No encontrada</p>;

  const price = Number(property.price) || 0;
  const tenPercent = price * 0.1;
  const offers = Number(property.offers) || 0;
  const balance = Number(wallet.balance) || 0;
  const canBuy = offers > 0 //&& balance >= tenPercent;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const confirmRechargeReflected = async (expectedMinBalance) => {
    const headers = getAuthHeaders();
    const maxAttempts = 6;
    let delay = 500;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await axios.get(`${API}/wallet`, {
          headers,
          params: { _: Date.now() },
        });
        const current = Number(res.data?.balance) || 0;
        if (current >= expectedMinBalance - 1e-6) {
          setWallet(res.data);
          return true;
        }
      } catch (error_) {
        // ignore transient errors while polling wallet (log for debugging)
        console.debug("wallet poll error:", error_);
      }
      await sleep(delay);
      delay = Math.min(delay + 500, 3000);
    }
    return false;
  };

  const handleRecharge = async () => {
    const amount = Number(recharge);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Ingresa un monto válido para recargar");
      return;
    }
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      alert("Debes iniciar sesión para recargar tu billetera");
      return;
    }

    const prevBalance = Number(wallet.balance) || 0;
    // optimista
    setWallet((w) => ({ ...w, balance: prevBalance + amount }));
    setRecharge("");

    try {
      // ❗️ sin /api extra y sin "}" al final
      const res = await axios.post(
        `${API}/wallet/recharge`,
        { amount },
        { headers }
      );

      if (res?.data?.balance !== undefined) {
        setWallet(res.data);
        return;
      }
      const ok = await confirmRechargeReflected(prevBalance + amount);
      if (!ok) await fetchWallet();
    } catch (e) {
      // revertir optimista si falla
      setWallet((w) => ({ ...w, balance: prevBalance }));
      alert(e?.response?.data?.error || "No se pudo recargar");
    }
  };

  const handleBuy = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      alert("Debes iniciar sesión para comprar/agendar");
      return;
    }
    try {
      // ❗️ /purchases (API ya trae /api)
      const res = await axios.post(
        `${API}/purchases/transaction`,
        { property_url: property.url }, // o { property_id: property.id } si tu back lo espera así
        { headers }
      );
      // Si el backend devuelve URL y token para redirigir a pasarela, navegar a la página de confirmación
      if (res?.data?.deposit_url && res?.data?.deposit_token) {
        const price = Number(property.price) || 0;
        const tenPercent = price * 0.1;
        // pass property identifiers so the confirm page can create intents and submit the form
        navigate(`/confirm-purchase`, {
          state: {
            // gateway fields
            deposit_url: res.data.deposit_url,
            deposit_token: res.data.deposit_token,
            property_id: property.id,
            property_url: property.url,
            amount: tenPercent,
            title: property.name,
            type: property.type || "property",
            price,
          },
        });
        return;
      }

      alert("Compra iniciada. Estado: " + (res.data.status || "pending"));
      console.log("Purchase response:", res.data);
      await fetchProperty();
      await fetchWallet();
      
    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo comprar");
      await fetchProperty();
      await fetchWallet();
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <button
          onClick={() => navigate(-1)} 
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          &larr; Volver
        </button>

      <h2>{property.name}</h2>
      {property.img && (
        <img src={property.img} alt={property.name} style={{ maxWidth: 400 }} />
      )}

      <p><strong>Ubicación:</strong> {property.location}</p>
      <p><strong>Precio arriendo:</strong> {price} {property.currency}</p>
      <p><strong>Visitas disponibles:</strong> {offers}</p>

      <hr />

      <h3>Agendar visita</h3>
      <p>
        Precio del agendamiento (10%):{" "}
        <strong>{tenPercent.toFixed(2)} {property.currency}</strong>
      </p>

      {/* <div style={{ margin: "12px 0" }}>
        <p><strong>Mi saldo:</strong> {balance.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Monto a recargar"
          value={recharge}
          onChange={(e) => setRecharge(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleRecharge}>Recargar</button>
      </div> */}

      <button disabled={!canBuy} onClick={handleBuy}>
        {canBuy ? "Comprar agendamiento" : "Saldo cupos"}
      </button>

      <div style={{ marginTop: 12 }}>
        <Link to="/my-visits">Ver mis visitas</Link>
      </div>
    </div>
  );
}
