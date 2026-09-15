"use client";

import { useEffect, useRef, useState } from "react";

/** Easing: ease-out cubic */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface Options {
  target: number;
  duration?: number; // ms, default 600
  enabled?: boolean; // skip animation when false
}

export function useCountUp({ target, duration = 600, enabled = true }: Options): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    // Cancel any in-progress animation
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    startRef.current = null;
    startValRef.current = value;

    const animate = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setValue(startValRef.current + (target - startValRef.current) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return value;
}
