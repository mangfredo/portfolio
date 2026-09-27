"use client";

/**
 * SheetFrame
 * Renders four registration-mark corner ticks (the classic "+" crosshair
 * from print drafting sheets), inset ~20px from the viewport edge.
 * Purely decorative — hidden on mobile (< 600px) per spec.
 *
 * Hover state: ticks switch from hollow outline to filled --accent.
 */
export default function SheetFrame() {
  return (
    <div
      aria-hidden="true"
      className="hidden sm:block fixed inset-0 pointer-events-none z-40"
      style={{ padding: "20px" }}
    >
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
        (pos) => (
          <Tick key={pos} position={pos} />
        )
      )}
    </div>
  );
}

function Tick({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const size = 10; // px — arm length of the crosshair
  const thickness = 1; // px

  const isTop    = position.startsWith("top");
  const isLeft   = position.endsWith("left");

  return (
    <div
      style={{
        position: "absolute",
        top:    isTop    ? "20px" : undefined,
        bottom: !isTop   ? "20px" : undefined,
        left:   isLeft   ? "20px" : undefined,
        right:  !isLeft  ? "20px" : undefined,
        width:  `${size * 2 + thickness}px`,
        height: `${size * 2 + thickness}px`,
      }}
    >
      <svg
        width={size * 2 + thickness}
        height={size * 2 + thickness}
        viewBox={`0 0 ${size * 2 + thickness} ${size * 2 + thickness}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Horizontal arm */}
        <line
          x1="0"
          y1={size + thickness / 2}
          x2={size * 2 + thickness}
          y2={size + thickness / 2}
          stroke="var(--line)"
          strokeWidth={thickness}
        />
        {/* Vertical arm */}
        <line
          x1={size + thickness / 2}
          y1="0"
          x2={size + thickness / 2}
          y2={size * 2 + thickness}
          stroke="var(--line)"
          strokeWidth={thickness}
        />
      </svg>
    </div>
  );
}
