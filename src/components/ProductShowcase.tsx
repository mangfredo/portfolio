"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export interface ShowcaseSlide {
  src: string;
  label: string;
  caption: string;
}

interface ProductShowcaseProps {
  slides: ShowcaseSlide[];
  title: string;
}

// One large screenshot driven by labeled mode tabs (ARIA tabs pattern).
// Switching crossfades in place — no autoplay, no resizing, no layout shift.
export default function ProductShowcase({ slides, title }: ProductShowcaseProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchX = useRef<number | null>(null);

  function select(i: number, focus = false) {
    const next = (i + slides.length) % slides.length;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  }

  function onTabKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); select(active + 1, true); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); select(active - 1, true); }
    if (e.key === "Home")       { e.preventDefault(); select(0, true); }
    if (e.key === "End")        { e.preventDefault(); select(slides.length - 1, true); }
  }

  return (
    <div className="showcase">
      <div className="showcase-tabs" role="tablist" aria-label={`${title} modes`} onKeyDown={onTabKey}>
        {slides.map((s, i) => (
          <button
            key={s.src}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            id={`${title}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${title}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="showcase-tab"
            onClick={() => select(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        id={`${title}-panel`}
        role="tabpanel"
        aria-labelledby={`${title}-tab-${active}`}
        className="showcase-frame"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) select(active + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={`${title} — ${s.label}`}
            width={833}
            height={942}
            sizes="(max-width: 767px) 90vw, 420px"
            className="showcase-img"
            data-active={i === active}
            aria-hidden={i !== active}
            draggable={false}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <p className="showcase-caption" aria-live="polite">
        {slides[active].caption}
      </p>
    </div>
  );
}
