import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ConfirmAdminSale() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE_URL || "https://api.propiedadesarquisis.me/api";
  const token = localStorage.getItem("token");

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    const loadIntent = async () => {
      try {
        const res = await axios.get(`${API}/purchases/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const p = res.data.find((x) => x.id === Number(id));

        if (!p) {
          alert("No se encontró esta visita del admin.");
          navigate("/");
          return;
        }

        setPurchase(p);
      } catch (err) {
        console.error(err);
        alert("Error cargando la visita del admin.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadIntent();
  }, [API, token, id, navigate]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const res = await axios.post(
        `${API}/purchases/resell-intent`,
        { purchase_intent_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { deposit_url, deposit_token } = res.data;

      if (!deposit_url || !deposit_token) {
        throw new Error("El servidor no entregó datos de pago.");
      }

      const form = formRef.current;
      form.action = deposit_url;
      form.method = "POST";

      form.querySelector("input[name='token_ws']").value = deposit_token;

      const returnUrl = `${window.location.origin}/admin-sale-completed?purchase_intent_id=${id}`;
      form.insertAdjacentHTML(
        "beforeend",
        `<input type="hidden" name="return_url" value="${returnUrl}" />`
      );

      form.submit();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error iniciando pago Webpay.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando…</p>;
  if (!purchase) return null;

  const schedulePrice =
    Number(purchase.custom_price_amount) ||
    Number(purchase.price_amount) * 0.1;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Confirmar compra (Reventa del Admin)</h1>

      <p>
        <strong>Propiedad:</strong> {purchase.propertie?.name} <br />
        <strong>Precio:</strong>{" "}
        {schedulePrice.toLocaleString("es-CL")}{" "}
        {purchase.price_currency}
      </p>

      <form ref={formRef}>
        <input type="hidden" name="token_ws" />

        <button
          onClick={handlePay}
          disabled={submitting}
        >
          {submitting ? "Procesando…" : "Pagar con Webpay"}
        </button>
      </form>
    </div>
  );
}
