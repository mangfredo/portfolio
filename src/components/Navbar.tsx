"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#automation", label: "Automation" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--bg) 90%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--card-border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <a
          href="#"
          className="font-mono text-xs tracking-[0.2em] uppercase transition-colors"
          style={{ color: "var(--fg-muted)" }}
        >
          T.Sereño
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-[var(--accent-bright)]"
                style={{ color: "var(--fg-muted)" }}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-[0.12em] uppercase transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: "var(--fg-muted)" }}
            >
              LinkedIn ↗
            </a>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2"
          style={{ color: "var(--fg-muted)" }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-6 pb-6 pt-4"
          style={{
            background: "color-mix(in srgb, var(--bg) 95%, transparent)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--card-border)",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-mono text-sm tracking-wider uppercase transition-colors"
              style={{ color: "var(--fg-muted)" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
