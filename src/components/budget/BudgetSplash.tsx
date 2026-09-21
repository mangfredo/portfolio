"use client";

import React, { useEffect, useState } from "react";

export const SPLASH_KEY = "lf_splash_shown";

export const BudgetSplash: React.FC = () => {
  // Always start as "inactive" on both server and client — no hydration mismatch.
  // useEffect runs only on the client and decides whether to show the splash.
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"mounting" | "visible" | "fading">("mounting");

  useEffect(() => {
    // Already shown during this visit — skip
    if (sessionStorage.getItem(SPLASH_KEY) === "1") return;

    // Mark as shown so navigating between tabs doesn't replay it
    sessionStorage.setItem(SPLASH_KEY, "1");

    // Show the splash
    setShow(true);
    const rafId = requestAnimationFrame(() => setPhase("visible"));
    const fadeTimer = setTimeout(() => setPhase("fading"), 2500);
    const doneTimer = setTimeout(() => setShow(false), 2700);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#090D16",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 200ms ease",
        pointerEvents: phase === "fading" ? "none" : "auto",
        fontFamily: "var(--font-outfit, Outfit, system-ui, sans-serif)",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: phase === "mounting" ? "scale(0.96) translateY(6px)" : "scale(1) translateY(0)",
          opacity: phase === "mounting" ? 0 : 1,
          transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <img
            src="/budget-tracker-logo-arrow.svg"
            alt="LaanFlow"
            width={56}
            height={56}
            style={{ borderRadius: 16, display: "block" }}
          />
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <span>Laan</span>
          <span style={{ color: "#38BDF8" }}>Flow</span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 20,
            width: 32,
            height: 2,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 99,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#38BDF8",
              transform: phase === "mounting" ? "translateX(-100%)" : "translateX(0)",
              transition: phase === "mounting" ? "none" : "transform 2500ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetSplash;
