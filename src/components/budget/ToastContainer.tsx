"use client";

import type { Toast } from "@/hooks/useToast";

interface Props {
  toasts: Toast[];
  dismiss: (id: string) => void;
  isDark: boolean;
}

const icons = { success: "✓", error: "✕", info: "ℹ" };

const colors = {
  light: {
    success: { bg: "rgba(0,201,122,0.12)", border: "rgba(0,201,122,0.3)", text: "#00875A" },
    error:   { bg: "rgba(255,82,82,0.12)",  border: "rgba(255,82,82,0.3)",  text: "#CC2B2B" },
    info:    { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#1D4ED8" },
  },
  dark: {
    success: { bg: "rgba(0,201,122,0.15)", border: "rgba(0,201,122,0.35)", text: "#00E699" },
    error:   { bg: "rgba(255,82,82,0.15)",  border: "rgba(255,82,82,0.35)",  text: "#FF5252" },
    info:    { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.35)", text: "#60A5FA" },
  },
};

export default function ToastContainer({ toasts, dismiss, isDark }: Props) {
  const palette = isDark ? colors.dark : colors.light;

  return (
    <div
      className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      {toasts.map((t) => {
        const c = palette[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.text,
              backdropFilter: "blur(8px)",
              animation: "bt-slide-in 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
              minWidth: "220px",
              maxWidth: "340px",
            }}
          >
            <span className="text-base flex-shrink-0">{icons[t.type]}</span>
            <span className="flex-1 leading-snug" style={{ fontFamily: "var(--bt-font-ui)" }}>
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
