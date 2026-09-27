"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about",      label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#work",       label: "Work" },
  { href: "#projects",   label: "Projects" },
  { href: "#automation", label: "Automation" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  /* Track active section for underline indicator */
  useEffect(() => {
    const sections = links.map((l) => l.href.slice(1));
    function onScroll() {
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 80) current = id;
      }
      setActive(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── TITLE BLOCK ─────────────────────────────────────────── */}
      <nav
        className="bp-title-block fixed top-0 left-0 right-0 z-50"
        aria-label="Site navigation"
      >
        {/* Name field */}
        <a
          href="#"
          className="bp-title-field"
          style={{ color: "var(--ink)", fontWeight: 500, minWidth: 0 }}
        >
          T.Sereño
        </a>

        {/* DRAWN field — name in full */}
        <span
          className="bp-title-field hidden lg:flex flex-col gap-0"
          style={{ padding: "0 1rem" }}
        >
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>DRAWN</span>
          <span style={{ fontSize: "0.72rem", color: "var(--ink)" }}>Tristan Sereño</span>
        </span>

        {/* CHECKED / role field */}
        <span
          className="bp-title-field hidden md:flex flex-col gap-0"
          style={{ padding: "0 1rem" }}
        >
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>CHECKED</span>
          <span style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>Software Engineer / Full-Stack</span>
        </span>

        {/* SCALE field — small wink */}
        <span
          className="bp-title-field hidden lg:flex flex-col gap-0"
          style={{ padding: "0 1rem" }}
        >
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>SCALE</span>
          <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>1:1</span>
        </span>

        {/* Nav tabs — flex-1 to fill remaining width */}
        <div className="hidden md:flex flex-1 items-stretch">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="bp-nav-tab"
              aria-current={active === l.href.slice(1) ? "page" : undefined}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* REV field */}
        <span
          className="bp-title-field hidden lg:flex flex-col gap-0"
          style={{ padding: "0 1rem" }}
        >
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>REV</span>
          <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>2026</span>
        </span>

        {/* LinkedIn — desktop only */}
        <a
          href="https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/"
          target="_blank"
          rel="noopener noreferrer"
          className="bp-title-field hidden md:flex"
          style={{ color: "var(--ink-soft)" }}
        >
          LinkedIn ↗
        </a>

        {/* Spacer on mobile to push toggle right */}
        <div className="flex-1 md:hidden" />

        {/* Theme toggle — always visible */}
        <div className="bp-title-field" style={{ paddingInline: "0.875rem" }}>
          <ThemeToggle />
        </div>

        {/* Burger — mobile only */}
        <button
          className="bp-title-field md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          style={{ paddingInline: "0.875rem", cursor: "pointer" }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {open
              ? <path d="M5 5l14 14M5 19L19 5" />
              : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </nav>

      {/* ── MOBILE NAV DRAWER ───────────────────────────────────── */}
      {open && (
        <div
          className="fixed top-[52px] left-0 right-0 z-40 border-b"
          style={{
            background: "var(--paper)",
            borderColor: "var(--line)",
          }}
          aria-label="Mobile navigation"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 font-mono text-sm tracking-wider border-b transition-colors"
              style={{
                color: active === l.href.slice(1) ? "var(--accent)" : "var(--ink-soft)",
                borderColor: "var(--line)",
                fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
