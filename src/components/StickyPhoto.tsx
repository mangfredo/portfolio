"use client";

import { useEffect, useState } from "react";

export default function StickyPhoto() {
  const [sticky, setSticky] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // On page load, check if already scrolled past hero
    const hero = document.getElementById("hero-photo");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) {
        setSticky(true);
      }
    }
    // Small delay so the initial render doesn't animate
    requestAnimationFrame(() => setLoaded(true));

    function onScroll() {
      const hero = document.getElementById("hero-photo");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      setSticky(rect.bottom < 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed z-40 bottom-6 right-6 select-none pointer-events-auto cursor-pointer"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        width: "56px",
        height: "56px",
        transition: loaded ? "opacity 0.5s ease, transform 0.5s ease" : "none",
        opacity: sticky ? 1 : 0,
        transform: sticky ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div
        className="w-full h-full rounded-full overflow-hidden border-2 shadow-lg"
        style={{
          borderColor: "var(--photo-border)",
          boxShadow: "0 4px 20px color-mix(in srgb, var(--photo-border) 30%, transparent)",
        }}
      >
        <img
          src="/profile.jpg"
          alt="Tristan Sereño"
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>
    </div>
  );
}
