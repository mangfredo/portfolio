"use client";

import { useState } from "react";
import EditorFile, { Mark } from "./ide/EditorFile";
import { slugify } from "./ide/files";
import { about } from "@/content/profile";
import { stack } from "@/content/about";

// Setting names for the three about paragraphs (labels only — the text is unchanged)
const aboutNames = ["Focus", "Working Style", "Craft"];

type Row = { id: string; group: string; name: string; desc?: React.ReactNode; text: string; values?: string[] };

const closing = `${about.closing.before}${about.closing.emphasis}${about.closing.after}`;

const rows: Row[] = [
  ...about.paragraphs.map((p, i) => ({ id: `about-${i}`, group: about.label, name: aboutNames[i], desc: p, text: p })),
  {
    id: "about-2",
    group: about.label,
    name: aboutNames[2],
    desc: (
      <>
        {about.closing.before}
        <em style={{ color: "var(--ink)" }}>{about.closing.emphasis}</em>
        {about.closing.after}
      </>
    ),
    text: closing,
  },
  ...stack.map((g) => ({
    id: `stack-${slugify(g.category)}`,
    group: about.stackLabel,
    name: g.category,
    text: g.items.join(" "),
    values: g.items,
  })),
];

const groups = [about.label, about.stackLabel];

export default function About() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q
    ? rows.filter((r) => `${r.group} ${r.name} ${r.text}`.toLowerCase().includes(q))
    : rows;

  return (
    <EditorFile id="about" label="About" plain>
      <h2 className="ide-h2 mb-6">
        <Mark>##</Mark>
        {about.heading}
      </h2>

      <label className="settings__search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings — try “react” or “remote”"
          aria-label="Search about and stack"
        />
        <span className="settings__count" aria-live="polite">
          {q ? `${visible.length} found` : `${rows.length} settings`}
        </span>
      </label>

      <div className="settings__scopes" aria-hidden="true">
        <span className="settings__scope" data-active="true">
          User
        </span>
        <span className="settings__scope">Workspace</span>
      </div>

      <div className="settings__layout">
        <nav className="settings__toc" aria-label="Settings categories">
          {groups.map((g) => (
            <a key={g} href={`#settings-${slugify(g)}`}>
              {g}
            </a>
          ))}
          {stack.map((g) => (
            <a key={g.category} href={`#stack-${slugify(g.category)}`} style={{ paddingLeft: "1.35rem" }}>
              {g.category}
            </a>
          ))}
        </nav>

        <div className="min-w-0">
          {groups.map((g) => {
            const list = visible.filter((r) => r.group === g);
            if (!list.length) return null;
            return (
              <section key={g} className="settings__group" aria-labelledby={`settings-${slugify(g)}`}>
                <h3 id={`settings-${slugify(g)}`} className="settings__group-title">
                  {g}
                </h3>
                {list.map((r) => (
                  <div key={r.id} id={r.id} className="setting" style={{ scrollMarginTop: "calc(var(--ide-top) + 1rem)" }}>
                    <p className="setting__name">
                      <span>{r.group}: </span>
                      <strong>{r.name}</strong>
                    </p>
                    {r.desc && <p className="setting__desc">{r.desc}</p>}
                    {r.values && (
                      <ul className="setting__values">
                        {r.values.map((v) => (
                          <li key={v} className="setting__check">
                            <span className="setting__box" aria-hidden="true">
                              ✓
                            </span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
          {!visible.length && <p className="settings__empty">No settings found for “{query}”.</p>}
        </div>
      </div>
    </EditorFile>
  );
}
