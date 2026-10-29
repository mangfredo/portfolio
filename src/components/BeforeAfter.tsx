"use client";

import { useState } from "react";
import Image from "next/image";

interface BeforeAfterProps {
  before: string;
  after: string;
  title: string;
}

// Drag-to-compare screenshot: "before" is clipped over "after".
// A transparent range input on top gives mouse, touch and keyboard control.
export default function BeforeAfter({ before, after, title }: BeforeAfterProps) {
  const [pos, setPos] = useState(50);

  return (
    <div className="ba" style={{ "--ba-pos": `${pos}%` } as React.CSSProperties}>
      <Image src={after} alt={`${title}: after, with the new theme and the Claude Code side panel`} fill sizes="(max-width: 1024px) 100vw, 900px" />
      <div className="ba__before">
        <Image src={before} alt={`${title}: before, the original admin interface`} fill sizes="(max-width: 1024px) 100vw, 900px" />
      </div>
      <span className="ba__divider" aria-hidden="true">
        <span className="ba__handle">⟷</span>
      </span>
      <span className="ba__label ba__label--before" aria-hidden="true">
        Before
      </span>
      <span className="ba__label ba__label--after" aria-hidden="true">
        After
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="ba__range"
        aria-label={`${title}: drag to compare before and after`}
      />
    </div>
  );
}
