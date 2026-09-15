"use client";

import { useEffect, useState } from "react";

export default function BudgetSplash() {
  // Skip if already shown this session (e.g. coming back from a period page)
  const [skip] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("bt_splash_shown")) return true;
    sessionStorage.setItem("bt_splash_shown", "1");
    return false;
  });

  // Phase: "visible" → "fading" → "done"
  const [phase, setPhase] = useState<"visible" | "fading" | "done">(skip ? "done" : "visible");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (skip) return; // already shown this session
    // Animate progress bar 0 → 100 over 900ms
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        // Hold at 100% briefly, then fade out
        setTimeout(() => setPhase("fading"), 200);
        setTimeout(() => setPhase("done"), 750); // after 550ms fade
      }
    };

    requestAnimationFrame(tick);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#090D16",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        opacity: phase === "fading" ? 0 : 1,
        transition: phase === "fading" ? "opacity 550ms cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: phase === "fading" ? "none" : "all",
      }}
    >
      {/* Logo mark */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Animated ring icon */}
        <svg
          width="64" height="64" viewBox="0 0 64 64" fill="none"
          style={{ animation: "bt-splash-spin 1.2s linear infinite" }}
        >
          <circle cx="32" cy="32" r="26" stroke="#1E293B" strokeWidth="5"/>
          <path
            d="M32 6 A26 26 0 0 1 58 32"
            stroke="url(#splashGrad)" strokeWidth="5" strokeLinecap="round"
          />
          <defs>
            <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D9488"/>
              <stop offset="100%" stopColor="#2DD4BF"/>
            </linearGradient>
          </defs>
        </svg>

        {/* App name */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#64748B", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Portfolio App
          </p>
          <h1 style={{ color: "#F8FAFC", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Budget Engine
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 3, background: "#1E293B", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #0D9488, #2DD4BF)",
            borderRadius: 99,
            transition: "width 16ms linear",
          }}
        />
      </div>

      <style>{`
        @keyframes bt-splash-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
