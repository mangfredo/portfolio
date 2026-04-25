"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#personal", label: "Client Work" },
  { href: "#scripts", label: "Scripts" },
  { href: "#infrastructure", label: "Infrastructure" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", borderColor: "var(--card-border)" }}>
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
        <ul className="hidden md:flex gap-10 items-center">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-base transition-colors" style={{ color: "var(--muted)" }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden transition-colors"
            style={{ color: "var(--muted)" }}
            aria-label="Toggle menu"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l16 16M6 22L22 6" /> : <path d="M4 7h20M4 14h20M4 21h20" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <ul className="md:hidden border-t backdrop-blur-md px-8 pb-6" style={{ borderColor: "var(--card-border)", background: "color-mix(in srgb, var(--background) 95%, transparent)" }}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-4 text-base transition-colors" style={{ color: "var(--muted)" }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
