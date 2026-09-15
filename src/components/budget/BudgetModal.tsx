"use client";

// ─── Loading overlay ───────────────────────────────────────────────────────
interface LoadingOverlayProps {
  message: string;
  isDark: boolean;
}

export function LoadingOverlay({ message, isDark }: LoadingOverlayProps) {
  const bg      = isDark ? "rgba(9,13,22,0.85)"  : "rgba(244,246,249,0.85)";
  const cardBg  = isDark ? "#1E293B"              : "#FFFFFF";
  const text    = isDark ? "#E2E8F0"              : "#0F172A";
  const spinner = isDark ? "#2DD4BF"              : "#0D9488";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: bg, backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: cardBg, borderRadius: 14, padding: "32px 40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 12px 40px rgba(13,27,42,0.15)",
          minWidth: 220,
        }}
      >
        {/* Spinner */}
        <svg
          width="40" height="40" viewBox="0 0 40 40" fill="none"
          style={{ animation: "bt-spin 0.8s linear infinite" }}
        >
          <circle cx="20" cy="20" r="16" stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="4"/>
          <path
            d="M20 4 A16 16 0 0 1 36 20"
            stroke={spinner} strokeWidth="4" strokeLinecap="round"
          />
        </svg>
        <p style={{ color: text, fontSize: "0.9rem", fontWeight: 500, margin: 0 }}>
          {message}
        </p>
      </div>
      <style>{`@keyframes bt-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Confirm dialog ────────────────────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title, message, confirmLabel = "Confirm", cancelLabel = "Cancel",
  danger = false, isDark, onConfirm, onCancel,
}: ConfirmModalProps) {
  const bg      = isDark ? "rgba(9,13,22,0.8)"   : "rgba(244,246,249,0.8)";
  const cardBg  = isDark ? "#1E293B"              : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0";
  const title_c = isDark ? "#F8FAFC"              : "#0F172A";
  const msg_c   = isDark ? "#94A3B8"              : "#475569";
  const cancelBg   = isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9";
  const cancelText = isDark ? "#94A3B8"           : "#64748B";
  const confirmBg  = danger ? "#EF4444"           : (isDark ? "#0D9488" : "#0D9488");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: bg, backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: cardBg, borderRadius: 14, padding: "28px 32px",
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 12px 40px rgba(13,27,42,0.15)",
          maxWidth: 360, width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: title_c, fontSize: "1rem", fontWeight: 700, margin: "0 0 8px" }}>
          {title}
        </h3>
        <p style={{ color: msg_c, fontSize: "0.875rem", margin: "0 0 24px", lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: cancelBg, color: cancelText,
              border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: confirmBg, color: "#FFFFFF",
              border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
