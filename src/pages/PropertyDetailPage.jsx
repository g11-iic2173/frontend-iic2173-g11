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

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };
  const backend = import.meta.env.VITE_API_BASE_URL;

  const fetchProperty = async () => {
    try {
      const res = await axios.get(`${backend}/properties/${id}`, { headers: authHeader });
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
      const res = await axios.get(`${backend}/wallet`, { headers: authHeader });
      setWallet(res.data);
    } catch {
      // si falla, el balance queda en 0
    }
  };

  useEffect(() => {
    fetchProperty();
    fetchWallet();
  }, [id]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p>{error}</p>;
  if (!property) return <p>No encontrada</p>;

  const tenPercent = Number(property.price) * 0.10;
  const canBuy = (property.offers || 0) > 0 && Number(wallet.balance) >= tenPercent;

  const handleRecharge = async () => {
    const amount = Number(recharge);
    if (!Number.isFinite(amount) || amount <= 0) return;
    try {
      await axios.post(`${backend}/wallet/recharge`, { amount }, { headers: authHeader });
      setRecharge("");
      fetchWallet();
    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo recargar");
    }
  };

  const handleBuy = async () => {
    try {
      const res = await axios.post(`${backend}/purchases`, { property_url: property.url }, { headers: authHeader });
      alert("Compra iniciada. Estado: " + (res.data.status || "pending"));
      //refrescamos para ver offers actualizados
      await fetchProperty();
      await fetchWallet();
      //o redirigimos a /mis-visitas para RF04
      //navigate("/mis-visitas");
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
      {property.img && <img src={property.img} alt={property.name} style={{ maxWidth: 400 }} />}
      <p><strong>Ubicación:</strong> {property.location}</p>
      <p><strong>Precio arriendo:</strong> {property.price} {property.currency}</p>
      <p><strong>Visitas disponibles:</strong> {property.offers ?? 0}</p>

      <hr />

      <h3>Agendar visita</h3>
      <p>Precio del agendamiento (10%): <strong>{tenPercent.toFixed(2)} {property.currency}</strong></p>

      <div style={{ margin: "12px 0" }}>
        <p><strong>Mi saldo:</strong> {Number(wallet.balance).toFixed(2)}</p>
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
