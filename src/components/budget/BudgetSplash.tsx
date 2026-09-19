"use client";

import { useEffect, useState } from "react";

let splashShown = false;

export default function BudgetSplash() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (splashShown) { setPhase("done"); return; }
    splashShown = true;

    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setPhase("fading"), 350);
        setTimeout(() => setPhase("done"), 1000);
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
        background: "#0F172A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        opacity: phase === "fading" ? 0 : 1,
        transition: phase === "fading" ? "opacity 650ms cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: phase === "fading" ? "none" : "all",
        fontFamily: "var(--font-outfit, Outfit, system-ui, sans-serif)",
      }}
    >
      {/* Ambient glow behind logo */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      {/* Logo + name */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, position:"relative", zIndex:1 }}>

        {/* Logo mark — animated ring with LF monogram */}
        <div style={{ position:"relative", width:80, height:80 }}>
          {/* Outer spinning arc */}
          <svg
            width="80" height="80" viewBox="0 0 80 80" fill="none"
            style={{ position:"absolute", inset:0, animation:"lf-spin 2s linear infinite" }}
          >
            <circle cx="40" cy="40" r="34" stroke="rgba(34,211,238,0.12)" strokeWidth="4"/>
            <path
              d="M40 6 A34 34 0 0 1 74 40"
              stroke="url(#lfGrad1)" strokeWidth="4" strokeLinecap="round"
            />
            <defs>
              <linearGradient id="lfGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22D3EE"/>
                <stop offset="100%" stopColor="#0EA5E9"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Inner counter-spinning arc */}
          <svg
            width="80" height="80" viewBox="0 0 80 80" fill="none"
            style={{ position:"absolute", inset:0, animation:"lf-spin-rev 3s linear infinite" }}
          >
            <path
              d="M40 14 A26 26 0 0 0 14 40"
              stroke="rgba(34,211,238,0.25)" strokeWidth="2.5" strokeLinecap="round"
            />
          </svg>

          {/* Center logo box */}
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              width:44, height:44, borderRadius:14,
              background:"linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 24px rgba(34,211,238,0.35)",
            }}>
              {/* "L" + flow arrow mark */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 5v10h8" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 20l4-4-4-4" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* App name */}
        <div style={{ textAlign:"center" }}>
          <p style={{
            color:"#475569",
            fontSize:"0.6rem",
            fontWeight:600,
            letterSpacing:"0.22em",
            textTransform:"uppercase",
            margin:"0 0 8px",
          }}>
            Personal Finance
          </p>
          <h1 style={{
            margin: 0,
            fontSize:"2rem",
            fontWeight:800,
            letterSpacing:"-0.03em",
            lineHeight:1,
          }}>
            <span style={{
              background:"linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>Laan</span>
            <span style={{
              background:"linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>Flow</span>
          </h1>
          <p style={{
            color:"#334155",
            fontSize:"0.7rem",
            fontWeight:500,
            letterSpacing:"0.06em",
            margin:"8px 0 0",
          }}>
            Track · Save · Grow
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position:"relative", zIndex:1, width:180 }}>
        <div style={{
          width:"100%", height:2,
          background:"rgba(255,255,255,0.06)",
          borderRadius:99, overflow:"hidden",
        }}>
          <div style={{
            height:"100%",
            width:`${progress}%`,
            background:"linear-gradient(90deg, #22D3EE, #0EA5E9)",
            borderRadius:99,
            boxShadow:"0 0 8px rgba(34,211,238,0.5)",
            transition:"width 16ms linear",
          }}/>
        </div>
        <p style={{
          color:"#334155",
          fontSize:"0.6rem",
          fontWeight:600,
          letterSpacing:"0.14em",
          textTransform:"uppercase",
          textAlign:"center",
          marginTop:12,
        }}>
          Loading
        </p>
      </div>

      <style>{`
        @keyframes lf-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lf-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
