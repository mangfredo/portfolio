"use client";

import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  src: string;
  className?: string;
}

export default function LazyVideo({ src, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="w-full bg-[var(--card-bg)] flex items-center justify-center"
          style={{ aspectRatio: "16/9" }}
        >
          <span className="text-[var(--fg-muted)] text-sm font-mono">Loading video...</span>
        </div>
      )}
    </div>
  );
}
