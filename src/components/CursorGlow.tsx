"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      glow.style.display = "none";
      return;
    }

    function onMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY };
    }

    let raf: number;
    function animate() {
      // Spring-like interpolation
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;

      if (glow) {
        glow.style.transform = `translate(${pos.current.x - 250}px, ${pos.current.y - 250}px)`;
      }
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 pointer-events-none z-0 cursor-glow"
      style={{
        width: 500,
        height: 500,
        borderRadius: "50%",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
