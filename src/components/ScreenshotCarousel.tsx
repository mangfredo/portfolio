"use client";

import { useState, useEffect, useCallback } from "react";

interface ScreenshotCarouselProps {
  screenshots: string[];
  title: string;
}

export default function ScreenshotCarousel({ screenshots, title }: ScreenshotCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    function update() {
      // matchMedia is primary, innerWidth is fallback
      setIsMobile(mq.matches || window.innerWidth < 768);
    }

    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  // Mobile: vertical sliding carousel
  if (isMobile) {
    return (
      <div className="my-4">
        {/* Vertical slide container */}
        <div
          className="relative w-full overflow-hidden rounded-lg border-2"
          style={{
            height: "420px",
            borderColor: "var(--accent)",
            boxShadow: "0 0 20px color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          {screenshots.map((src, i) => {
            let offset = i - active;
            // Wrap around
            if (offset > screenshots.length / 2) offset -= screenshots.length;
            if (offset < -screenshots.length / 2) offset += screenshots.length;

            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
                style={{
                  transform: `translateY(${offset * 100}%)`,
                  opacity: offset === 0 ? 1 : 0.3,
                  zIndex: offset === 0 ? 2 : 1,
                }}
              >
                <img
                  src={src}
                  alt={`${title} screenshot ${i + 1}`}
                  className="w-auto max-w-full max-h-[400px] object-contain"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Controls below */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={prev}
            aria-label="Previous screenshot"
            className="w-10 h-10 rounded-full flex items-center justify-center border font-mono text-lg transition-all active:scale-95"
            style={{
              background: "color-mix(in srgb, var(--accent) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
              color: "var(--accent)",
            }}
          >
            ‹
          </button>

          <div className="flex items-center gap-2">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to screenshot ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? "20px" : "6px",
                  height: "6px",
                  background: i === active
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--fg-muted) 30%, transparent)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next screenshot"
            className="w-10 h-10 rounded-full flex items-center justify-center border font-mono text-lg transition-all active:scale-95"
            style={{
              background: "color-mix(in srgb, var(--accent) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
              color: "var(--accent)",
            }}
          >
            ›
          </button>
        </div>
      </div>
    );
  }

  // Desktop: horizontal strip with focus effect
  return (
    <div
      className="my-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex items-center justify-center gap-3 py-3">
        <button
          onClick={prev}
          aria-label="Previous screenshot"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-110 font-mono text-sm"
          style={{
            background: "color-mix(in srgb, var(--accent) 8%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
            color: "var(--accent)",
          }}
        >
          ‹
        </button>

        <div className="flex items-center justify-center gap-3 overflow-hidden py-2 px-2">
          {screenshots.map((src, i) => {
            const isActive = i === active;
            const distance = Math.abs(i - active);
            const wrapDist = Math.min(distance, screenshots.length - distance);

            return (
              <div
                key={i}
                onMouseEnter={() => setActive(i)}
                className="shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-out cursor-default relative"
                style={{
                  height: isActive ? "240px" : "160px",
                  width: "auto",
                  borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  transform: isActive ? "scale(1.03)" : `scale(${Math.max(0.82, 1 - wrapDist * 0.07)})`,
                  opacity: isActive ? 1 : Math.max(0.35, 1 - wrapDist * 0.22),
                  filter: isActive ? "brightness(1.05)" : `brightness(${Math.max(0.5, 0.75 - wrapDist * 0.1)})`,
                  boxShadow: isActive
                    ? "0 0 20px color-mix(in srgb, var(--accent) 30%, transparent)"
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
              </div>
            );
          })}
        </div>

        <button
          onClick={next}
          aria-label="Next screenshot"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-110 font-mono text-sm"
          style={{
            background: "color-mix(in srgb, var(--accent) 8%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
            color: "var(--accent)",
          }}
        >
          ›
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2">
        {screenshots.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to screenshot ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? "20px" : "6px",
              height: "6px",
              background: i === active
                ? "var(--accent)"
                : "color-mix(in srgb, var(--fg-muted) 30%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
