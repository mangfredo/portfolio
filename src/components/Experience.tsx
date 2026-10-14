"use client";

import { useState } from "react";
import EditorFile, { Mark } from "./ide/EditorFile";
import { slugify } from "./ide/files";
import { experience, education } from "@/content/experience";
import { projects } from "@/content/projects";
import { sections } from "@/content/profile";

// Decorative short "commit hash" derived from the text, so it is stable between builds
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

/* ── Graph model ──────────────────────────────────────────────────
 * Three lanes, newest commit on top:
 *   main       — jobs (YWCI → Rival HR, HEAD)
 *   education  — 2021–2025, merges into main
 *   freelance  — 2021 → still running alongside everything
 * Each row says what every lane draws next to it.
 * ─────────────────────────────────────────────────────────────── */
type Lane = "main" | "education" | "freelance";
type Cell = "none" | "line" | "nodeUp" | "nodeDown" | "merge";

const lanes: Lane[] = ["main", "education", "freelance"];

const rivalHr = experience.find((j) => j.company === "Rival HR");
const ywci = experience.find((j) => j.company === "YWCI Manpower Services");
const freelance = experience.find((j) => j.company === "Freelance / Contract");

// War stories that came out of the Rival HR role
const related: Record<string, { title: string; href: string }[]> = {
  "Rival HR": projects.map((p) => ({ title: p.title, href: `#work-${slugify(p.title)}` })),
};

type Row = {
  id: string;
  lane: Lane;
  cells: Record<Lane, Cell>;
  refs: { label: string; head?: boolean }[];
  title: string;
  subtitle: string;
  period: string;
  where?: string;
  job?: (typeof experience)[number];
};

const rows: Row[] = [
  rivalHr && {
    id: "rival-hr",
    lane: "main" as const,
    cells: { main: "nodeDown", education: "none", freelance: "line" } as Record<Lane, Cell>,
    refs: [{ label: "HEAD → main", head: true }],
    title: rivalHr.company,
    subtitle: rivalHr.role,
    period: rivalHr.period,
    where: `${rivalHr.location} · ${rivalHr.type}`,
    job: rivalHr,
  },
  ywci && {
    id: "ywci",
    lane: "main" as const,
    cells: { main: "nodeUp", education: "merge", freelance: "line" } as Record<Lane, Cell>,
    refs: [],
    title: ywci.company,
    subtitle: ywci.role,
    period: ywci.period,
    where: `${ywci.location} · ${ywci.type}`,
    job: ywci,
  },
  {
    id: "education",
    lane: "education" as const,
    cells: { main: "none", education: "nodeUp", freelance: "line" } as Record<Lane, Cell>,
    refs: [{ label: sections.experience.educationLabel }],
    title: education.degree,
    subtitle: education.school,
    period: education.period,
  },
  freelance && {
    id: "freelance",
    lane: "freelance" as const,
    cells: { main: "none", education: "none", freelance: "nodeUp" } as Record<Lane, Cell>,
    refs: [{ label: "freelance" }],
    title: freelance.company,
    subtitle: freelance.role,
    period: freelance.period,
    where: `${freelance.location} · ${freelance.type}`,
    job: freelance,
  },
].filter(Boolean) as Row[];

function RelatedStories({ links }: { links?: { title: string; href: string }[] }) {
  if (!links?.length) return null;
  return (
    <p className="gg-related">
      <span className="tok-com">{"// related: "}</span>
      {links.map((x, i) => (
        <span key={x.href}>
          <a href={x.href} className="ide-link">
            {x.title}
          </a>
          {i < links.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}

export default function Experience() {
  // The current role starts expanded
  const [open, setOpen] = useState<Record<string, boolean>>({ "rival-hr": true });

  return (
    <EditorFile id="experience" label="Experience">
      <p className="ln ide-comment mb-3">
        <span className="tok-kw" style={{ fontStyle: "normal" }}>$</span> git log --graph --all
      </p>
      <h2 className="ln ide-h2 mb-6">
        <Mark>##</Mark>
        {sections.experience.heading}
      </h2>

      <div className="ln gg-legend" aria-hidden="true">
        {lanes.map((l) => (
          <span key={l} className="gg-legend__item" data-lane={l}>
            <span className="gg-legend__swatch" /> {l}
          </span>
        ))}
      </div>

      <ol className="ln gg">
        {rows.map((r) => {
          const isOpen = !!open[r.id];
          const panelId = `gg-${r.id}`;
          return (
            <li key={r.id} className="gg-row" data-open={isOpen}>
              <div className="gg-lanes" aria-hidden="true">
                {lanes.map((l) => (
                  <span key={l} className="gg-lane" data-lane={l} data-cell={r.cells[l]} data-head={r.refs.some((x) => x.head)} />
                ))}
              </div>

              <div className="gg-body">
                <h3 className="gg-head">
                  <button
                    type="button"
                    className="gg-summary"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen((s) => ({ ...s, [r.id]: !isOpen }))}
                  >
                    <span className="gg-hash" aria-hidden="true">
                      {hash(r.title + r.subtitle)}
                    </span>
                    {r.refs.map((ref) => (
                      <span key={ref.label} className={`gg-ref ${ref.head ? "gg-ref--head" : ""}`} data-lane={r.lane}>
                        {ref.label}
                      </span>
                    ))}
                    <span className="gg-title">
                      <span className="gg-role">{r.subtitle}</span>
                      <span className="gg-at"> @ </span>
                      <span className="gg-company">{r.title}</span>
                    </span>
                    <span className="gg-period">{r.period}</span>
                    <span className="gg-caret" aria-hidden="true">
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </button>
                </h3>

                <div id={panelId} className="gg-details" hidden={!isOpen}>
                  {r.job ? (
                    <>
                      {r.where && <p className="gg-where">{r.where}</p>}
                      <p className="glog__desc">{r.job.description}</p>
                      <ul className="glog__diff">
                        {r.job.highlights.map((h) => (
                          <li key={h} className="glog__add">
                            <span className="glog__plus" aria-hidden="true">
                              +
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="glog__tags">
                        {r.job.tags.map((t) => (
                          <span key={t} className="ide-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                      <RelatedStories links={related[r.job.company]} />
                    </>
                  ) : (
                    <>
                      <p
                        className="mono mb-2"
                        style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                      >
                        {sections.experience.certificationsLabel}
                      </p>
                      <ul className="glog__diff">
                        {education.certifications.map((cert) => (
                          <li key={cert} className="glog__add">
                            <span className="glog__plus" aria-hidden="true">
                              ✓
                            </span>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </EditorFile>
  );
}
