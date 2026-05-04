"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [animating, setAnimating] = useState(false);
  const bulbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    if (animating) return;

    // Check if View Transitions API is available
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    const next = !dark;
    const bulb = bulbRef.current;
    if (!bulb) return;

    const rect = bulb.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height;

    setPulling(true);
    setAnimating(true);

    // Hide cursor glow during transition
    const cursorGlow = document.querySelector(".cursor-glow") as HTMLElement;
    if (cursorGlow) cursorGlow.style.visibility = "hidden";

    setTimeout(() => {
      setPulling(false);

      if (doc.startViewTransition) {
        // Use View Transitions API — the browser handles the snapshot + animation
        const transition = doc.startViewTransition(() => {
          setDark(next);
          document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
          localStorage.setItem("theme", next ? "dark" : "light");
        });

        transition.ready.then(() => {
          const maxX = Math.max(cx, window.innerWidth - cx);
          const maxY = Math.max(cy, window.innerHeight - cy);
          const maxRadius = Math.sqrt(maxX * maxX + maxY * maxY) + 50;

          if (next) {
            // Going DARK → old light view shrinks INTO the bulb
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(${maxRadius}px at ${cx}px ${cy}px)`,
                  `circle(0px at ${cx}px ${cy}px)`,
                ],
              },
              {
                duration: 600,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-old(root)",
              }
            );
          } else {
            // Going LIGHT → new light view expands FROM the bulb
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${cx}px ${cy}px)`,
                  `circle(${maxRadius}px at ${cx}px ${cy}px)`,
                ],
              },
              {
                duration: 600,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          }

          setTimeout(() => {
            setAnimating(false);
            if (cursorGlow) cursorGlow.style.visibility = "";
          }, 650);
        });
      } else {
        // Fallback: just switch instantly with CSS transition
        setDark(next);
        document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
        localStorage.setItem("theme", next ? "dark" : "light");

        setTimeout(() => {
          setAnimating(false);
          if (cursorGlow) cursorGlow.style.visibility = "";
        }, 350);
      }
    }, 280);
  }, [dark, animating]);

  return (
    <button
      ref={bulbRef}
      onClick={toggle}
      type="button"
      className="relative flex flex-col items-center cursor-pointer select-none group"
      style={{ width: "32px" }}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      {/* String / cord */}
      <div
        className="w-px transition-all duration-300 ease-out"
        style={{
          height: pulling ? "28px" : "16px",
          background: "var(--fg-muted)",
          opacity: 0.4,
        }}
      />

      {/* Bulb */}
      <div
        className={`relative transition-all duration-300 ease-out ${pulling ? "translate-y-1 scale-95" : "group-hover:translate-y-0.5"}`}
      >
        {/* Bulb base / socket */}
        <div
          className="w-3 h-1.5 mx-auto rounded-t-sm"
          style={{ background: "var(--fg-muted)", opacity: 0.5 }}
        />
        {/* Bulb glass */}
        <div
          className="w-5 h-5 rounded-full mx-auto -mt-0.5 transition-all duration-300"
          style={{
            background: dark ? "var(--fg-muted)" : "#fbbf24",
            opacity: dark ? 0.3 : 1,
            boxShadow: dark
              ? "none"
              : "0 0 12px rgba(251, 191, 36, 0.6), 0 0 24px rgba(251, 191, 36, 0.3)",
          }}
        />
      </div>

      {/* Pull indicator on hover */}
      <div
        className="absolute -bottom-4 font-mono text-[0.5rem] uppercase tracking-wider opacity-0 group-hover:opacity-50 transition-opacity"
        style={{ color: "var(--fg-muted)" }}
      >
        pull
      </div>
    </button>
  );
}
