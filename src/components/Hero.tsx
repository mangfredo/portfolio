"use client";

import { useEffect, useState } from "react";
import Terminal from "./Terminal";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  useEffect(() => {
    // Small delay so the page renders first, then trigger animation
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Start terminal typing after heading animation completes
  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setTerminalReady(true), 900);
    return () => clearTimeout(timer);
  }, [revealed]);

  // Words for the heading with their line breaks
  const lines = [
    { words: ["I", "build", "the", "tools"], color: undefined },
    { words: ["that", "build", "the"], color: undefined },
    { words: ["product."], color: "var(--terracotta)" },
  ];

  // Calculate global word index for stagger
  let globalIndex = 0;

  return (
    <section className="relative min-h-screen flex items-center px-6 sm:px-10 pt-20 pb-12 overflow-hidden">
      {/* Subtle gradient wash — asymmetric, not centered */}
      <div
        className="absolute top-0 right-0 w-[70%] h-[80%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 80% 20%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[50%] h-[40%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 20% 90%, color-mix(in srgb, var(--terracotta) 5%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-end">
        {/* Left — Text heavy, asymmetric on desktop, centered on mobile */}
        <div className="text-center md:text-left">
          {/* Mobile-only photo */}
          <div
            className={`md:hidden w-28 h-28 rounded-full overflow-hidden border-2 select-none pointer-events-none mb-6 mx-auto hero-fade ${revealed ? "visible" : ""}`}
            style={{
              borderColor: "var(--accent)",
              boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 25%, transparent)",
              transitionDelay: "0ms",
            }}
          >
            <img
              src="/profile.jpg"
              alt="Tristan Sereño"
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>

          <p
            className={`sel-invert font-mono text-xs tracking-[0.25em] uppercase mb-6 hero-fade ${revealed ? "visible" : ""}`}
            style={{ color: "var(--accent-bright)", transitionDelay: "50ms" }}
          >
            Software Engineer · Full-Stack Developer
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {lines.map((line, lineIdx) => (
              <span key={lineIdx}>
                {line.words.map((word) => {
                  const idx = globalIndex++;
                  return (
                    <span
                      key={`${lineIdx}-${word}-${idx}`}
                      className={`hero-word ${revealed ? "revealed" : ""} ${line.color ? "sel-invert" : ""}`}
                      style={{
                        color: line.color || undefined,
                        animationDelay: revealed ? `${idx * 90}ms` : undefined,
                      }}
                    >
                      {word}
                      {/* Add space after each word except last in line */}
                      {word !== line.words[line.words.length - 1] ? "\u00A0" : ""}
                    </span>
                  );
                })}
                {lineIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p
            className={`text-lg sm:text-xl leading-relaxed max-w-xl mb-10 mx-auto md:mx-0 sel-muted hero-fade ${revealed ? "visible" : ""}`}
            style={{ color: "var(--fg-muted)", transitionDelay: "800ms" }}
          >
            5+ years turning complex business problems into clean, fast systems.
            One recent project cut a 6-hour manual process down to under 10
            minutes — a{" "}
            <span className="font-medium" style={{ color: "var(--fg)" }}>
              97% efficiency gain
            </span>{" "}
            that freed the team to focus on work that actually matters.
          </p>

          <div
            className={`flex flex-wrap items-center justify-center md:justify-start gap-4 hero-fade ${revealed ? "visible" : ""}`}
            style={{ transitionDelay: "1000ms" }}
          >
            <a
              href="#work"
              className="sel-btn magnetic-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              See the work
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <a
              href="#automation"
              className="sel-btn sel-btn-outline magnetic-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md border transition-colors hover:border-[var(--accent)]"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--fg-muted)",
              }}
            >
              Automation suite
            </a>
          </div>
        </div>

        {/* Right — Photo + Terminal */}
        <div className="hidden md:flex flex-col items-center justify-between gap-6 relative w-full h-full">
          {/* Profile photo */}
          <div
            className={`w-48 h-48 rounded-full overflow-hidden border-2 select-none pointer-events-none shrink-0 hero-fade ${revealed ? "visible" : ""}`}
            style={{
              borderColor: "var(--accent)",
              boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 25%, transparent)",
              transitionDelay: "400ms",
            }}
          >
            <img
              src="/profile.jpg"
              alt="Tristan Sereño"
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>

          {/* Terminal with theme switcher */}
          <div
            className={`w-full hero-fade ${revealed ? "visible" : ""}`}
            style={{ transitionDelay: "700ms" }}
          >
            <Terminal startTyping={terminalReady} onComplete={() => setShowAnnotation(true)} />
          </div>

          {/* Annotation — appears after terminal animation completes */}
          <div
            className={`sel-muted absolute -bottom-8 -left-4 font-mono text-xs rotate-[-2deg] hero-fade ${showAnnotation ? "visible" : ""}`}
            style={{ color: "var(--fg-muted)", transitionDelay: "0ms" }}
          >
            ↑ this used to take 6 hours by hand
          </div>

          {/* Try it annotation — appears shortly after */}
          <div
            className={`sel-accent absolute -bottom-8 right-0 font-mono text-xs rotate-[1.5deg] hero-fade ${showAnnotation ? "visible" : ""}`}
            style={{ color: "var(--accent)", transitionDelay: "600ms" }}
          >
            try typing &quot;help&quot; ↑
          </div>
        </div>
      </div>
    </section>
  );
}
