"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import EditorFile from "./ide/EditorFile";
import { TERMINAL_EVENT } from "./ide/IdeShell";
import { slugify } from "./ide/files";
import { hero, profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { personalProjects } from "@/content/personal-projects";
import { experience } from "@/content/experience";

const NBSP = String.fromCharCode(160);

// "Recent" — the war stories plus the featured personal project
const recent = [
  ...projects.map((p) => ({
    label: p.title,
    href: `#work-${slugify(p.title)}`,
    path: `~/war-stories/${slugify(p.title)}.md`,
  })),
  ...personalProjects
    .filter((p) => p.featured)
    .map((p) => ({ label: p.title, href: `#project-${slugify(p.title)}`, path: `~/projects/${slugify(p.title)}` })),
];

const current = experience.find((job) => job.current);

export default function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Small delay so the page renders first, then trigger animation
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  let globalIndex = 0;

  return (
    <EditorFile id="top" label="Introduction" plain>
      <div className="welcome">
        {/* ── Left: title, Start, Recent ── */}
        <div className="min-w-0">
          <div className="welcome__id">
            <div className="hero-avatar">
              <Image src={profile.photo} alt={profile.name} width={56} height={56} priority />
            </div>
            <div>
              <p className="welcome__name">{profile.name}</p>
              <p className="welcome__role">{profile.role}</p>
            </div>
          </div>

          <h1 className="welcome__title">
            <span className="sr-only">Tristan Sereño: </span>
            {hero.lines.map((line, lineIdx) => (
              <span key={lineIdx}>
                {line.words.map((word, wi) => {
                  const idx = globalIndex++;
                  return (
                    <span
                      key={`${lineIdx}-${idx}`}
                      className={`hero-word ${line.accent ? "hero-accent" : ""}`}
                      data-on={revealed}
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      {word}
                      {wi < line.words.length - 1 ? NBSP : ""}
                    </span>
                  );
                })}
                {lineIdx < hero.lines.length - 1 ? <br /> : <span className="hero-caret" aria-hidden="true" />}
              </span>
            ))}
          </h1>

          <p className="welcome__lead hero-fadein" data-on={revealed} style={{ transitionDelay: "600ms" }}>
            {hero.intro.before}
            <span className="font-medium" style={{ color: "var(--ink)" }}>
              {hero.intro.highlight}
            </span>
            {hero.intro.after}
          </p>

          <div className="hero-fadein" data-on={revealed} style={{ transitionDelay: "800ms" }}>
            <h2 className="welcome__h">Start</h2>
            <div className="welcome__list">
              {hero.ctas.map((c) => (
                <a key={c.href} href={c.href} className="welcome__action">
                  <span className="welcome__action-icon" aria-hidden="true">
                    {c.primary ? "▶" : "⧉"}
                  </span>
                  {c.label}
                </a>
              ))}
              <a href="#contact" className="welcome__action">
                <span className="welcome__action-icon" aria-hidden="true">
                  ✉
                </span>
                Contact
              </a>
              <button
                type="button"
                className="welcome__action"
                onClick={() => window.dispatchEvent(new Event(TERMINAL_EVENT))}
              >
                <span className="welcome__action-icon" aria-hidden="true">
                  {">_"}
                </span>
                Open terminal <kbd>Ctrl+`</kbd>
              </button>
            </div>

            <h2 className="welcome__h">Recent</h2>
            <ul className="welcome__list" style={{ justifyItems: "stretch" }}>
              {recent.map((r) => (
                <li key={r.href} className="welcome__recent">
                  <a href={r.href}>{r.label}</a>
                  <span className="welcome__path">{r.path}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: highlights ── */}
        <aside className="welcome__side hero-fadein" data-on={revealed} style={{ transitionDelay: "1000ms" }} aria-label="Highlights">
          <h2 className="welcome__h" style={{ marginTop: 0 }}>
            Highlights
          </h2>
          <div className="walk">
            {current && (
              <a href="#experience" className="walk__card walk__card--now">
                <span className="walk__label">
                  <span className="walk__now-dot" aria-hidden="true" />
                  {current.period}
                </span>
                <span className="walk__title">
                  {current.role} · {current.company}
                </span>
              </a>
            )}
            {projects.map((p) => (
              <a key={p.sheet} href={`#work-${slugify(p.title)}`} className="walk__card">
                <span className="walk__metric">{p.metric}</span>
                <span className="walk__label">{p.metricLabel}</span>
                <span className="walk__title">{p.title}</span>
              </a>
            ))}
          </div>
          <p className="welcome__startup" aria-hidden="true">
            <span className="welcome__check">✓</span> Show welcome page on startup
          </p>
        </aside>
      </div>
    </EditorFile>
  );
}
