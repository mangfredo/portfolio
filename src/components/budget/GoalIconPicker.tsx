"use client";

import { useState } from "react";

// ── 32 finance/life goal SVG icons ────────────────────────────────────────
export const GOAL_ICONS: Record<string, { label: string; svg: React.ReactNode }> = {
  piggybank: {
    label: "Piggy Bank",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11c.7-.4 1-1 1-1.7C20 8 18.7 7 17 7h-1V5a5 5 0 0 0-10 0v2H5a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h.5l1 5h9l1-5H19z"/><circle cx="15.5" cy="9.5" r=".5" fill="currentColor"/><path d="M20 11h2"/></svg>,
  },
  house: {
    label: "Home",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  },
  car: {
    label: "Car",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11l1.5-4.5h11L19 11"/><rect x="2" y="11" width="20" height="6" rx="1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M2 14h1M21 14h1"/></svg>,
  },
  airplane: {
    label: "Travel",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-4-4-1 5-7-2-1 3 7 3v4l3-1v-4l3 1V12z"/><path d="M3 17h3"/><path d="M3 20h2"/></svg>,
  },
  graduation: {
    label: "Education",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17c0 2.5 4.5 5 10 5s10-2.5 10-5"/><path d="M2 12v5M22 12v5"/><path d="M17 9.5V15"/></svg>,
  },
  heart: {
    label: "Health",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  },
  baby: {
    label: "Family / Baby",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/><path d="M9 11l3 3 3-3"/></svg>,
  },
  ring: {
    label: "Wedding",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="7"/><path d="M8 7l1-4h6l1 4"/><path d="M9 7h6"/></svg>,
  },
  laptop: {
    label: "Tech / Laptop",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M1 20h22"/></svg>,
  },
  phone: {
    label: "Phone",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>,
  },
  gym: {
    label: "Fitness",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16M18 4v16M6 12h12"/><path d="M2 8v8M22 8v8"/></svg>,
  },
  briefcase: {
    label: "Business",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/></svg>,
  },
  chart: {
    label: "Investments",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  },
  shield: {
    label: "Emergency Fund",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
  },
  tools: {
    label: "Renovation",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  music: {
    label: "Music",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  },
  camera: {
    label: "Photography",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  },
  book: {
    label: "Books / Learning",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  gift: {
    label: "Gift / Celebration",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  },
  sun: {
    label: "Retirement",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  },
  paw: {
    label: "Pet",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="4" cy="11" r="2"/><circle cx="20" cy="11" r="2"/><path d="M12 22c-3 0-7-3-7-7 0-2 1.5-3.5 3.5-4 1-.2 2.1-.5 3.5-.5s2.5.3 3.5.5C17.5 11.5 19 13 19 15c0 4-4 7-7 7z"/></svg>,
  },
  leaf: {
    label: "Nature / Environment",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.35c-.7 1.09.4 2.3 1.55 1.83C7.5 20.12 12 18 14 12"/><path d="M17 8l2-4-4 2a6 6 0 0 0-4 5.66C11 17 14 19 14 12"/></svg>,
  },
  globe: {
    label: "World Travel",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  paintbrush: {
    label: "Art / Creative",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 0 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5L4.5 15"/></svg>,
  },
  coffee: {
    label: "Lifestyle",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>,
  },
  trophy: {
    label: "Achievement",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  star: {
    label: "Dream Goal",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  coin: {
    label: "Savings",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v1m0 8v1"/><path d="M9.5 10c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 2.5-5 2.5-5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5"/></svg>,
  },
  flame: {
    label: "Urgent / Priority",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c0 1.38-1.12 2.5-2.5 2.5A4.5 4.5 0 0 1 4 15c0-4 3-8.5 3-8.5S9 10 8.5 14.5z"/><path d="M18.5 14.5A2.5 2.5 0 0 1 16 17c0 1.38 1.12 2.5 2.5 2.5A4.5 4.5 0 0 0 23 15c0-4-3-8.5-3-8.5S18.5 10.5 18.5 14.5z"/><path d="M12 22c2.76 0 5-2.24 5-5 0-5-5-9-5-9s-5 4-5 9c0 2.76 2.24 5 5 5z"/></svg>,
  },
  seedling: {
    label: "New Start",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M12 20V10"/><path d="M12 10a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5z"/><path d="M12 10c0-3 1.5-6 4-7"/></svg>,
  },
  zap: {
    label: "Quick Goal",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  anchor: {
    label: "Stability",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v13M5 11H2a10 10 0 0 0 20 0h-3"/></svg>,
  },
  umbrella: {
    label: "Safety Net",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>,
  },
};

export const GOAL_ICON_KEYS = Object.keys(GOAL_ICONS);

// ── GoalIconPicker component ──────────────────────────────────────────────

interface GoalIconPickerProps {
  selected: string;
  onChange: (key: string) => void;
  color?: string;
}

export default function GoalIconPicker({ selected, onChange, color = "var(--wf-cyan)" }: GoalIconPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedIcon = GOAL_ICONS[selected];

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button — shows selected icon */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Pick an icon"
        style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          color: color,
          transition: "background 150ms ease, border-color 150ms ease",
        }}
      >
        <span style={{ width: 20, height: 20, display: "block" }}>
          {selectedIcon?.svg ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>
            </svg>
          )}
        </span>
      </button>

      {/* Dropdown picker */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 900 }}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 901,
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 12,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            width: 280,
          }}>
            <p style={{ color: "#64748B", fontSize: "0.65rem", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Choose an icon
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6,
              maxHeight: 220, overflowY: "auto",
            }}>
              {GOAL_ICON_KEYS.map((key) => {
                const isSelected = key === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    title={GOAL_ICONS[key].label}
                    onClick={() => { onChange(key); setOpen(false); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? `${color}25` : "rgba(255,255,255,0.04)",
                      border: isSelected ? `1.5px solid ${color}60` : "1.5px solid transparent",
                      cursor: "pointer",
                      color: isSelected ? color : "#94A3B8",
                      transition: "all 120ms ease",
                    }}
                  >
                    <span style={{ width: 16, height: 16, display: "block" }}>
                      {GOAL_ICONS[key].svg}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
