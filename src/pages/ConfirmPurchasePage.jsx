import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ConfirmPurchase form page
export default function ConfirmPurchasePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If no state at all, redirect home
    if (!state) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const depositUrl = state?.deposit_url || state?.url;
  const depositToken = state?.deposit_token || state?.token;
  const title = state?.title || state?.property_name || "";
  const amount = state?.amount === undefined ? (state?.available_offers ?? 1) : state.amount;
  const price = state?.price ?? state?.price_amount ?? 0;
  const type = state?.type || "property";

  const API = import.meta.env.VITE_API_BASE_URL;

  const getAuthHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  if (!state) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const property_url = state.property_url || state.url || null;
    const property_id = state.property_id || null;
    const deposit_token = depositToken || null;

    if (!property_url || !property_id || !deposit_token) {
      console.log("Missing required data:", { state });
      alert("Faltan datos requeridos para crear el intent (property_url, property_id o deposit_token)");
      return;
    }

    setSubmitting(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(`${API}/purchases/create-intent`, { property_url, property_id, deposit_token }, { headers });

      // enviar el formulario al gateway ahora
      if (formRef.current) formRef.current.submit();
    } catch (err) {
      console.error("create-intent error:", err?.response?.data || err.message || err);
      alert(err?.response?.data?.error || "No se pudo crear el intento de pago");
    } finally {
      setSubmitting(false);
    }
  };

  if (!depositUrl || !depositToken) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Confirmar compra</h2>
        <p className="mt-4">No se encontró información de pago. Vuelve atrás o intenta nuevamente.</p>
        <div className="mt-4">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded">Volver</button>
        </div>
      </div>
    );
  }

  const total = Number(price) * Number(amount);
  const buttonLabel = submitting ? "Procesando…" : `Pagar $${Number.isNaN(total) ? "-" : total}`;

  return (
    <div className="p-20">
      <p className="text-6xl text-center font-extrabold text-sky-500">Confirmar compra</p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 border rounded-xl shadow-[0_0px_8px_#b4b4b4] p-6 mt-5"
        action={depositUrl}
        method="POST"
      >
        {/* token field expected by Webpay / Transbank examples */}
        <input type="hidden" name="token_ws" value={depositToken} />
        {state.order_id && <input type="hidden" name="order_id" value={state.order_id} />}

        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">{title}</p>
        </div>

        <button disabled={submitting} className="bg-sky-500 text-white rounded px-5 py-2" type="submit">
          Compra de {amount} CL
        </button>
      </form>
    </div>
  );
}
