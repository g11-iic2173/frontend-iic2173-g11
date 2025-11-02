import { useEffect } from "react";
import ConfirmPurchasePage from "../pages/ConfirmPurchasePage";

export default function ConfirmPurchaseModal({ open, onClose, purchaseData }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 999,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "40%",
          maxWidth: "600px",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-6px 0 15px rgba(0,0,0,0.25)",
          zIndex: 1000,
          overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.5rem 1rem",
            borderBottom: "1px solid #eee",
          }}
        >
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "1.6rem",
              cursor: "pointer",
              color: "#444",
            }}
          >
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div style={{ padding: "1.5rem" }}>
          <ConfirmPurchasePage initialData={purchaseData} />
        </div>
      </div>
    </>
  );
}
