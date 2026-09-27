"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Terminal from "./Terminal";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setTerminalReady(true), 900);
    return () => clearTimeout(timer);
  }, [revealed]);

  const lines: { words: string[]; accent?: boolean }[] = [
    { words: ["I", "build", "the", "tools"] },
    { words: ["that", "build", "the"] },
    { words: ["product."], accent: true },
  ];

  let globalIndex = 0;

  return (
    <section
      className="relative min-h-screen flex items-center px-6 sm:px-10 overflow-hidden"
      style={{ paddingTop: "6rem", paddingBottom: "4rem" }}
      aria-label="Introduction"
    >
      <div
        className="relative w-full"
        style={{ maxWidth: "1120px", marginInline: "auto" }}
      >
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-start">

          {/* ── LEFT: text ───────────────────────────────────────── */}
          <div className="text-left relative">

            {/* Mobile photo */}
            <div
              className={`md:hidden w-24 h-24 overflow-hidden border mb-8 hero-fade ${revealed ? "visible" : ""}`}
              style={{ borderColor: "var(--line)", transitionDelay: "0ms" }}
            >
              <Image
                src="/profile.jpg"
                alt="Tristan Sereño"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Headline */}
            <h1
              className="mb-8 leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(2.6rem, 6vw, 3.5rem)", fontWeight: 500 }}
            >
              <span className="sr-only">Tristan Sereño: </span>
              {lines.map((line, lineIdx) => (
                <span key={lineIdx} style={{ display: "block" }}>
                  {line.words.map((word) => {
                    const idx = globalIndex++;
                    return (
                      <span
                        key={`${lineIdx}-${word}-${idx}`}
                        className={`hero-word ${revealed ? "revealed" : ""}`}
                        style={{
                          animationDelay: revealed ? `${idx * 90}ms` : undefined,
                          color: line.accent ? "var(--accent)" : "var(--ink)",
                          /* annotation-style underline on "product." */
                          ...(line.accent
                            ? {
                                textDecoration: "underline",
                                textDecorationColor: "var(--accent)",
                                textDecorationThickness: "2px",
                                textUnderlineOffset: "5px",
                              }
                            : {}),
                        }}
                      >
                        {word}
                        {word !== line.words[line.words.length - 1] ? "\u00A0" : ""}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>

            {/* Body copy */}
            <p
              className={`max-w-xl mb-4 hero-fade ${revealed ? "visible" : ""}`}
              style={{
                color: "var(--ink-soft)",
                lineHeight: 1.7,
                fontSize: "1rem",
                transitionDelay: "800ms",
              }}
            >
              5+ years turning complex business problems into clean, fast systems.
              One recent project cut a 6-hour manual process down to under 10 minutes.
            </p>

            {/* Leader-line callout for the 97% metric */}
            <div
              className={`flex items-center mb-8 hero-fade ${revealed ? "visible" : ""}`}
              style={{ transitionDelay: "900ms", gap: "0" }}
              aria-label="97% efficiency gain"
            >
              <span className="bp-leader-line" aria-hidden="true" />
              <span className="bp-leader-dot" aria-hidden="true" />
              <span className="bp-leader-value">97%</span>
              <span className="bp-leader-label">efficiency gain</span>
            </div>

            {/* CTA buttons */}
            <div
              className={`flex flex-wrap gap-3 mb-10 hero-fade ${revealed ? "visible" : ""}`}
              style={{ transitionDelay: "1000ms" }}
            >
              <a href="#work" className="bp-btn bp-btn--primary">
                See the work
              </a>
              <a href="#automation" className="bp-btn bp-btn--outline">
                Automation suite
              </a>
            </div>

            {/* Terminal — mobile version below buttons */}
            <div
              className={`md:hidden hero-fade ${revealed ? "visible" : ""}`}
              style={{ transitionDelay: "1100ms" }}
            >
              <Terminal startTyping={terminalReady} onComplete={() => setShowAnnotation(true)} />
              {showAnnotation && (
                <p
                  className="font-mono text-xs mt-3 rotate-[-1.5deg] inline-block"
                  style={{ color: "var(--ink-soft)", fontSize: "0.68rem" }}
                >
                  ↑ this used to take 6 hours by hand
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT: photo + terminal ───────────────────────────── */}
          <div className="hidden md:flex flex-col items-center gap-6 relative">

            {/* §8-E: Stamp badge — top-right of the right column, clears the headline */}
            <div
              className={`self-end hero-fade ${revealed ? "visible" : ""}`}
              style={{ transitionDelay: "1200ms" }}
              aria-hidden="true"
            >
              <div className="bp-stamp">
                <span className="bp-stamp__line1">Available</span>
                <span className="bp-stamp__line2">2026</span>
              </div>
            </div>

            {/* Profile photo — hairline border, no radius */}
            <div
              className={`overflow-hidden border flex-shrink-0 hero-fade ${revealed ? "visible" : ""}`}
              style={{
                width: "clamp(140px, 16vw, 200px)",
                height: "clamp(140px, 16vw, 200px)",
                borderColor: "var(--line)",
                transitionDelay: "300ms",
              }}
            >
              <Image
                src="/profile.jpg"
                alt="Tristan Sereño"
                width={200}
                height={200}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Terminal */}
            <div
              className={`w-full hero-fade ${revealed ? "visible" : ""}`}
              style={{ transitionDelay: "650ms" }}
            >
              <Terminal startTyping={terminalReady} onComplete={() => setShowAnnotation(true)} />
            </div>

            {/* Annotation note */}
            <div
              className={`absolute -bottom-8 -left-4 font-mono text-xs rotate-[-2deg] hero-fade ${showAnnotation ? "visible" : ""}`}
              style={{ color: "var(--ink-soft)", fontSize: "0.68rem", transitionDelay: "0ms" }}
              aria-hidden="true"
            >
              ↑ this used to take 6 hours by hand
            </div>

            <div
              className={`absolute -bottom-8 right-0 font-mono text-xs rotate-[1.5deg] hero-fade ${showAnnotation ? "visible" : ""}`}
              style={{ color: "var(--accent)", fontSize: "0.68rem", transitionDelay: "600ms" }}
              aria-hidden="true"
            >
              try typing &quot;help&quot; ↑
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
