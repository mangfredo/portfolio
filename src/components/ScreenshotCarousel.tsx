"use client";

import { useState, useEffect, useCallback } from "react";

interface ScreenshotCarouselProps {
  screenshots: string[];
  title: string;
}

export default function ScreenshotCarousel({ screenshots, title }: ScreenshotCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  // Auto-rotate every 4 seconds unless paused
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="mt-6 mb-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main carousel area */}
      <div className="relative flex items-center justify-center gap-3 py-4">
        {/* Prev button */}
        <button
          onClick={prev}
          aria-label="Previous screenshot"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:scale-110"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
            color: "var(--accent)",
          }}
        >
          ‹
        </button>

        {/* Screenshots strip */}
        <div className="flex items-center justify-center gap-4 overflow-hidden py-2 px-2">
          {screenshots.map((src, i) => {
            const isActive = i === active;
            const distance = Math.abs(i - active);
            // Wrap-around distance
            const wrapDist = Math.min(distance, screenshots.length - distance);

            return (
              <div
                key={i}
                onMouseEnter={() => setActive(i)}
                className="shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-out cursor-default relative"
                style={{
                  height: isActive ? "260px" : "180px",
                  width: "auto",
                  borderColor: isActive
                    ? "var(--accent)"
                    : "var(--card-border)",
                  transform: isActive
                    ? "scale(1.05)"
                    : `scale(${Math.max(0.8, 1 - wrapDist * 0.08)})`,
                  opacity: isActive ? 1 : Math.max(0.4, 1 - wrapDist * 0.2),
                  filter: isActive ? "brightness(1.1)" : `brightness(${Math.max(0.5, 0.8 - wrapDist * 0.1)})`,
                  boxShadow: isActive
                    ? "0 0 24px color-mix(in srgb, var(--accent) 40%, transparent), 0 0 60px color-mix(in srgb, var(--accent) 15%, transparent)"
                    : "none",
                  zIndex: isActive ? 10 : 5 - wrapDist,
                }}
              >
                <img
                  src={src}
                  alt={`${title} screenshot ${i + 1}`}
                  className="h-full w-auto object-contain"
                  draggable={false}
                />
                {/* Active glow overlay */}
                {isActive && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 40%, transparent 60%, color-mix(in srgb, var(--accent) 12%, transparent) 100%)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          aria-label="Next screenshot"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:scale-110"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
            color: "var(--accent)",
          }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {screenshots.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to screenshot ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? "24px" : "8px",
              height: "8px",
              background:
                i === active
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--muted) 40%, transparent)",
              boxShadow:
                i === active
                  ? "0 0 8px color-mix(in srgb, var(--accent) 50%, transparent)"
                  : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
