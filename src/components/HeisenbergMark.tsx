// Original minimal vector mark — pork-pie hat, dark glasses, goatee.
// Hat, glasses and goatee stay black in both themes (the recognizable silhouette);
// outline and band use theme tokens so the mark still reads on dark backgrounds.
const BLACK = "#15171c";
const FACE = "oklch(0.92 0.012 80)";

export default function HeisenbergMark() {
  return (
    <figure className="hb-mark" aria-label="Minimal illustration of a bald man in a pork-pie hat and dark glasses">
      <svg viewBox="0 0 120 140" width="112" height="131" aria-hidden="true">
        <defs>
          <clipPath id="hb-lenses">
            <rect x="37" y="66" width="20" height="13" rx="4" />
            <rect x="63" y="66" width="20" height="13" rx="4" />
          </clipPath>
        </defs>

        {/* Ears */}
        <ellipse cx="33" cy="76" rx="4" ry="7" fill={FACE} stroke={BLACK} strokeWidth="2" />
        <ellipse cx="87" cy="76" rx="4" ry="7" fill={FACE} stroke={BLACK} strokeWidth="2" />

        {/* Head */}
        <path
          d="M34 48 C33 78 38 104 60 122 C82 104 87 78 86 48 Z"
          fill={FACE}
          stroke={BLACK}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Glasses */}
        <g fill={BLACK}>
          <rect x="37" y="66" width="20" height="13" rx="4" />
          <rect x="63" y="66" width="20" height="13" rx="4" />
          <rect x="56" y="69" width="8" height="2.5" rx="1.25" />
          <rect x="30" y="68" width="8" height="2" rx="1" />
          <rect x="82" y="68" width="8" height="2" rx="1" />
        </g>
        <g clipPath="url(#hb-lenses)">
          <rect className="hb-glint" x="20" y="56" width="6" height="34" fill="#ffffff" opacity="0.5" />
        </g>

        {/* Goatee + mustache, with mouth gap */}
        <path d="M49 95 C53 90 67 90 71 95 L71 107 C67 117 53 117 49 107 Z" fill={BLACK} />
        <path d="M55 101 Q60 103 65 101" stroke={FACE} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Pork-pie hat — tips on hover; thin theme-colored rim keeps it visible in dark mode */}
        <g className="hb-hat" stroke="var(--ink-soft)" strokeOpacity="0.35" strokeWidth="1">
          <ellipse cx="60" cy="48" rx="47" ry="7" fill={BLACK} />
          <path d="M32 46 L35 22 C36 16 84 16 85 22 L88 46 Z" fill={BLACK} />
          <rect x="33.5" y="36" width="53" height="7" fill="var(--accent)" opacity="0.85" stroke="none" />
          <path d="M40 20 C50 24 70 24 80 20" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
      <figcaption className="hb-caption font-mono">say my name.</figcaption>
    </figure>
  );
}
