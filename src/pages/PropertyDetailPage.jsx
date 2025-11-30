import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";

  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
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

  useEffect(() => {
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p>{error}</p>;
  if (!property) return <p>No encontrada</p>;

  const price = Number(property.price) || 0;
  const tenPercent = price * 0.1;
  const offers = Number(property.offers) || 0;

  const canBuy = offers > 0;

  const handleBuy = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      alert("Debes iniciar sesión para comprar/agendar");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/purchases/transaction`,
        { property_url: property.url },
        { headers }
      );

      if (res?.data?.deposit_url && res?.data?.deposit_token) {
        const price = Number(property.price) || 0;
        const tenPercent = price * 0.1;

        navigate(`/confirm-purchase`, {
          state: {
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
      await fetchProperty();

    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo comprar");
      await fetchProperty();
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

      <button disabled={!canBuy} onClick={handleBuy}>
        {canBuy ? "Comprar agendamiento" : "Sin cupos"}
      </button>

      <div style={{ marginTop: 12 }}>
        <Link to="/my-visits">Ver mis visitas</Link>
      </div>
    </div>
  );
}
