"use client";

import { useState } from "react";
import {
  PiggyBank, House, Car, AirplaneTilt, GraduationCap, Heart, Baby, Diamond, Laptop, DeviceMobile, Barbell, Briefcase, ChartLineUp, ShieldCheck, Wrench, MusicNotes, Camera, BookOpen, Gift, SunHorizon, PawPrint, Leaf, GlobeHemisphereWest, PaintBrush, Coffee, Trophy, Star, Coins, Flame, Plant, Lightning, Anchor, Umbrella,
} from "@phosphor-icons/react";

// ── Finance/life goal icons (Phosphor, regular weight) ────────────────────
// Keys are stored on each goal, so keep them stable when changing icons.
// Icons fill their container (size="100%") and use the current text color.
export const GOAL_ICONS: Record<string, { label: string; svg: React.ReactNode }> = {
  piggybank: { label: "Piggy Bank", svg: <PiggyBank size="100%" /> },
  house: { label: "Home", svg: <House size="100%" /> },
  car: { label: "Car", svg: <Car size="100%" /> },
  airplane: { label: "Travel", svg: <AirplaneTilt size="100%" /> },
  graduation: { label: "Education", svg: <GraduationCap size="100%" /> },
  heart: { label: "Health", svg: <Heart size="100%" /> },
  baby: { label: "Family / Baby", svg: <Baby size="100%" /> },
  ring: { label: "Wedding", svg: <Diamond size="100%" /> },
  laptop: { label: "Tech / Laptop", svg: <Laptop size="100%" /> },
  phone: { label: "Phone", svg: <DeviceMobile size="100%" /> },
  gym: { label: "Fitness", svg: <Barbell size="100%" /> },
  briefcase: { label: "Business", svg: <Briefcase size="100%" /> },
  chart: { label: "Investments", svg: <ChartLineUp size="100%" /> },
  shield: { label: "Emergency Fund", svg: <ShieldCheck size="100%" /> },
  tools: { label: "Renovation", svg: <Wrench size="100%" /> },
  music: { label: "Music", svg: <MusicNotes size="100%" /> },
  camera: { label: "Photography", svg: <Camera size="100%" /> },
  book: { label: "Books / Learning", svg: <BookOpen size="100%" /> },
  gift: { label: "Gift / Celebration", svg: <Gift size="100%" /> },
  sun: { label: "Retirement", svg: <SunHorizon size="100%" /> },
  paw: { label: "Pet", svg: <PawPrint size="100%" /> },
  leaf: { label: "Nature / Environment", svg: <Leaf size="100%" /> },
  globe: { label: "World Travel", svg: <GlobeHemisphereWest size="100%" /> },
  paintbrush: { label: "Art / Creative", svg: <PaintBrush size="100%" /> },
  coffee: { label: "Lifestyle", svg: <Coffee size="100%" /> },
  trophy: { label: "Achievement", svg: <Trophy size="100%" /> },
  star: { label: "Dream Goal", svg: <Star size="100%" /> },
  coin: { label: "Savings", svg: <Coins size="100%" /> },
  flame: { label: "Urgent / Priority", svg: <Flame size="100%" /> },
  seedling: { label: "New Start", svg: <Plant size="100%" /> },
  zap: { label: "Quick Goal", svg: <Lightning size="100%" /> },
  anchor: { label: "Stability", svg: <Anchor size="100%" /> },
  umbrella: { label: "Safety Net", svg: <Umbrella size="100%" /> },
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
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
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
                      background: isSelected ? `color-mix(in srgb, ${color} 15%, transparent)` : "rgba(255,255,255,0.04)",
                      border: isSelected ? `1.5px solid color-mix(in srgb, ${color} 38%, transparent)` : "1.5px solid transparent",
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
