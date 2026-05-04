"use client";

import { useState } from "react";

const themes = [
  {
    id: "macos",
    label: "macOS",
    headerBg: "var(--card-bg)",
    headerBorder: "var(--card-border)",
    bodyBg: "var(--card-bg)",
    border: "var(--card-border)",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
      </div>
    ),
    titleText: "~/projects/offer-letter-engine",
    prompt: "$",
    promptColor: "var(--accent-bright)",
    textColor: "var(--fg-muted)",
    successColor: "var(--accent-bright)",
    arrowColor: "var(--accent)",
  },
  {
    id: "linux",
    label: "Linux",
    headerBg: "#2d2d2d",
    headerBorder: "#404040",
    bodyBg: "#1a1a2e",
    border: "#404040",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: "#666", background: "transparent" }} />
        <span className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: "#666", background: "transparent" }} />
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#e85050" }} />
      </div>
    ),
    titleText: "tristan@dev:~/projects/offer-letter-engine",
    prompt: "tristan@dev:~$",
    promptColor: "#5af78e",
    textColor: "#a9b1d6",
    successColor: "#5af78e",
    arrowColor: "#7aa2f7",
  },
  {
    id: "windows",
    label: "PowerShell",
    headerBg: "#012456",
    headerBorder: "#012456",
    bodyBg: "#012456",
    border: "#1a3a6a",
    radius: "0.5rem",
    titleBar: (
      <div className="flex items-center gap-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    ),
    titleText: "Windows PowerShell",
    prompt: "PS C:\\projects>",
    promptColor: "#ffff00",
    textColor: "#cccccc",
    successColor: "#54ff54",
    arrowColor: "#cccccc",
  },
  {
    id: "retro",
    label: "Retro",
    headerBg: "#000080",
    headerBorder: "#000080",
    bodyBg: "#000000",
    border: "#c0c0c0",
    radius: "0",
    titleBar: (
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold" style={{ color: "#ffffff" }}>■</span>
      </div>
    ),
    titleText: "C:\\PROJECTS\\OFFER-LETTER-ENGINE",
    prompt: "C:\\>",
    promptColor: "#c0c0c0",
    textColor: "#00ff00",
    successColor: "#00ff00",
    arrowColor: "#00ff00",
  },
  {
    id: "ubuntu",
    label: "Ubuntu",
    headerBg: "#300a24",
    headerBorder: "#5c2d4f",
    bodyBg: "#300a24",
    border: "#5c2d4f",
    radius: "0.75rem",
    titleBar: (
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: "#e95420" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#848484" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#848484" }} />
      </div>
    ),
    titleText: "tristan@ubuntu:~/projects/offer-letter-engine",
    prompt: "tristan@ubuntu:~$",
    promptColor: "#4e9a06",
    textColor: "#d3d7cf",
    successColor: "#4e9a06",
    arrowColor: "#729fcf",
  },
];

export default function Terminal() {
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[themeIndex];

  function cycleTheme() {
    setThemeIndex((prev) => (prev + 1) % themes.length);
  }

  return (
    <div className="w-full relative">
      {/* Theme toggle button */}
      <button
        onClick={cycleTheme}
        className="absolute -top-3 -right-3 z-10 px-2.5 py-1 rounded-full font-mono text-[0.6rem] uppercase tracking-wider border transition-all hover:scale-105 cursor-pointer select-none"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          color: "var(--fg-muted)",
        }}
        aria-label="Switch terminal theme"
        title={`Current: ${theme.label}. Click to switch.`}
      >
        {theme.label}
      </button>

      <div
        className="overflow-hidden border transition-all duration-300"
        style={{
          background: theme.bodyBg,
          borderColor: theme.border,
          borderRadius: theme.radius,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 border-b transition-all duration-300"
          style={{
            background: theme.headerBg,
            borderColor: theme.headerBorder,
          }}
        >
          {theme.titleBar}
          <span
            className="ml-1 font-mono text-xs truncate transition-colors duration-300"
            style={{ color: theme.textColor }}
          >
            {theme.titleText}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 font-mono text-sm leading-relaxed transition-colors duration-300">
          <p style={{ color: theme.textColor }}>
            <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
            node generate --template WD_SWE_Contract
          </p>
          <p className="mt-2" style={{ color: theme.textColor }}>
            <span style={{ color: theme.arrowColor }}>→</span> Parsing
            document structure...
          </p>
          <p style={{ color: theme.textColor }}>
            <span style={{ color: theme.arrowColor }}>→</span> Extracting
            conditions (47 rules)
          </p>
          <p style={{ color: theme.textColor }}>
            <span style={{ color: theme.arrowColor }}>→</span> Compiling
            placeholders...
          </p>
          <p style={{ color: theme.textColor }}>
            <span style={{ color: theme.arrowColor }}>→</span> Validating
            output against schema
          </p>
          <p className="mt-2" style={{ color: theme.successColor }}>
            ✓ Generated production-ready JS in 8.2s
          </p>
          <p style={{ color: theme.textColor }}>
            <span style={{ color: theme.promptColor }}>{theme.prompt}</span>{" "}
            <span className="cursor-blink">▊</span>
          </p>
        </div>
      </div>
    </div>
  );
}
