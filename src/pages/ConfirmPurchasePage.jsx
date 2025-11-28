import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ConfirmPurchasePage() {
  const location = useLocation();
  const state = location.state;
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if no state
  useEffect(() => {
    if (!state) navigate("/");
  }, [state, navigate]);

  if (!state) return null;

  const depositUrl = state.deposit_url || state.url;
  const depositToken = state.deposit_token || state.token;
  const title = state.title || state.property_name || "";
  const propertyUrl = state.property_url || state.url || null;
  const propertyId = state.property_id || null;

  const price = state?.price ?? state?.price_amount ?? 0;
  const amount =
    state?.amount === undefined ? state?.available_offers ?? 1 : state.amount;

  const API =
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.propiedadesarquisis.me/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!propertyUrl || !propertyId || !depositToken) {
      alert("Faltan datos requeridos para confirmar la compra.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        `${API}/purchases/create-intent`,
        {
          property_url: propertyUrl,
          property_id: propertyId,
          deposit_token: depositToken,
        },
        { headers: getAuthHeaders() }
      );

      if (formRef.current) formRef.current.submit();
    } catch (err) {
      console.error("create-intent error:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "No se pudo crear el intento de pago");
      setSubmitting(false);
    }
  };

  if (!depositUrl || !depositToken) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Confirmar compra</h2>
        <p className="mt-4">
          No se encontró información de pago. Intenta nuevamente.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-3 py-2 bg-gray-200 rounded"
        >
          Volver
        </button>
      </div>
    );
  }

  const total = Number(price) * Number(amount);

  return (
    <div className="p-20">
      <p className="text-6xl text-center font-extrabold text-sky-500">
        Confirmar compra
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 border rounded-xl shadow-[0_0px_8px_#b4b4b4] p-6 mt-5"
        action={depositUrl}
        method="POST"
      >
        <input type="hidden" name="token_ws" value={depositToken} />

        <p className="text-2xl font-bold">{title}</p>

        <button
          disabled={submitting}
          className="bg-sky-500 text-white rounded px-5 py-2"
          type="submit"
        >
          {submitting ? "Procesando…" : `Comprar por $${total}`}
        </button>
      </form>
    </div>
  );
}
