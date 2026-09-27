/**
 * DimDate — §8-D Dimension-line date range
 *
 * Renders a date string as a real dimension line:
 * tick → arrowhead — label — arrowhead ← tick
 * The SVG width is calculated from the label's approximate character count.
 */

interface DimDateProps {
  label: string;
  className?: string;
}

export default function DimDate({ label, className = "" }: DimDateProps) {
  // Approximate px width: ~6.5px per character at 0.68rem mono
  const charW = 6.5;
  const padding = 28; // space for arrowheads on each side
  const w = Math.max(80, label.length * charW + padding * 2);
  const mid = w / 2;
  const ah = 4; // arrowhead half-height

  return (
    <span className={`dim ${className}`} aria-label={label}>
      {/* Dimension rule with outward arrowheads */}
      <svg
        className="dim__rule"
        viewBox={`0 0 ${w} 14`}
        width={w}
        height={14}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left tick */}
        <line x1="2" y1="2" x2="2" y2="12" stroke="var(--ink-soft)" strokeWidth="1" />
        {/* Left arrowhead (pointing left, outward) */}
        <path d={`M${padding} 7 L${padding - 8} ${7 - ah} M${padding} 7 L${padding - 8} ${7 + ah}`}
          stroke="var(--ink-soft)" strokeWidth="1" />
        {/* Horizontal rule */}
        <line x1={padding} y1="7" x2={w - padding} y2="7" stroke="var(--ink-soft)" strokeWidth="1" />
        {/* Right arrowhead (pointing right, outward) */}
        <path d={`M${w - padding} 7 L${w - padding + 8} ${7 - ah} M${w - padding} 7 L${w - padding + 8} ${7 + ah}`}
          stroke="var(--ink-soft)" strokeWidth="1" />
        {/* Right tick */}
        <line x1={w - 2} y1="2" x2={w - 2} y2="12" stroke="var(--ink-soft)" strokeWidth="1" />
      </svg>

      <span className="dim__label">{label}</span>
    </span>
  );
}
