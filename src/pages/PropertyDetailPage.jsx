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

  const API = import.meta.env.VITE_API_BASE;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProperty = async () => {
    try {
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
        // si no hay sesión, deja el balance en 0 silenciosamente
        setWallet({ balance: 0 });
        return;
      }
      const res = await axios.get(`${API}/wallet`, { headers });
      setWallet(res.data);
    } catch {
      // si falla, el balance queda en 0
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
  const canBuy = offers > 0 && balance >= tenPercent;

  const handleRecharge = async () => {
    const amount = Number(recharge);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Ingresa un monto válido para recargar");
      return;
    }
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      alert("Debes iniciar sesión para recargar tu billetera");
      // navigate("/login"); // descomenta si quieres redirigir
      return;
    }
    try {
      await axios.post(
        `${API}/wallet/recharge`,
        { amount },
        { headers }
      );
      setRecharge("");
      fetchWallet();
    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo recargar");
    }
  };

  const handleBuy = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      alert("Debes iniciar sesión para comprar/agendar");
      // navigate("/login");
      return;
    }
    try {
      const res = await axios.post(
        `${API}/purchases`,
        { property_url: property.url }, // si tu back usa id, cambia a { property_id: property.id }
        { headers }
      );
      alert("Compra iniciada. Estado: " + (res.data.status || "pending"));

      // refrescar datos
      await fetchProperty();
      await fetchWallet();

      // o redirigir a mis visitas
      // navigate("/my-visits");
    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo comprar");
      await fetchProperty();
      await fetchWallet();
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Link to="/">&larr; Volver</Link>

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

      <div style={{ margin: "12px 0" }}>
        <p><strong>Mi saldo:</strong> {balance.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Monto a recargar"
          value={recharge}
          onChange={(e) => setRecharge(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleRecharge}>Recargar</button>
      </div>

      <button disabled={!canBuy} onClick={handleBuy}>
        {canBuy ? "Comprar agendamiento" : "Saldo insuficiente o sin cupos"}
      </button>

      <div style={{ marginTop: 12 }}>
        <Link to="/my-visits">Ver mis visitas</Link>
      </div>
    </div>
  );
}
