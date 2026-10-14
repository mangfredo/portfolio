"use client";

import { useEffect, useRef, useState } from "react";
import ProductShowcase from "./ProductShowcase";
import EditorFile, { Mark } from "./ide/EditorFile";
import FileIcon from "./ide/FileIcon";
import { slugify } from "./ide/files";
import { personalProjects } from "@/content/personal-projects";
import { sections } from "@/content/profile";

type Project = (typeof personalProjects)[number];

function linkLabel(link: string) {
  return link.startsWith("/")
    ? "Open ↗"
    : link.includes("github.com")
    ? "GitHub ↗"
    : link.includes("apps.microsoft.com")
    ? "Store ↗"
    : "Visit ↗";
}

function ProjectLink({ link }: { link: string | null }) {
  if (!link) return null;
  return (
    <a
      href={link}
      target={link.startsWith("/") ? "_self" : "_blank"}
      rel={link.startsWith("/") ? undefined : "noopener noreferrer"}
      className="ide-link"
    >
      {linkLabel(link)}
    </a>
  );
}

// Quick Open filters — derived from each project's kind and tags
const filters: { id: string; label: string; match: (p: Project) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "published", label: "Published", match: (p) => p.kind === "Published App" },
  { id: "web", label: "Web", match: (p) => p.kind.includes("Web") || p.tags.includes("Next.js") },
  { id: "mobile", label: "Mobile", match: (p) => p.tags.includes("React Native") || p.kind === "Mobile App" },
  { id: "desktop", label: "Desktop", match: (p) => p.tags.some((t) => t === "Windows Forms" || t === "WinUI 3") },
];

const idOf = (p: Project) => `project-${slugify(p.title)}`;
const initial = personalProjects.find((p) => p.featured) ?? personalProjects[0];

export default function PersonalProjects() {
  const [selected, setSelected] = useState(idOf(initial));
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const detailRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const active = filters.find((f) => f.id === filter)!;
  const list = personalProjects.filter(
    (p) => active.match(p) && (!q || `${p.title} ${p.kind} ${p.platform} ${p.tags.join(" ")}`.toLowerCase().includes(q))
  );

  // Explorer / Welcome links point at #project-<slug>: select it and bring the section into view
  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!personalProjects.some((p) => idOf(p) === id)) return;
      setSelected(id);
      setFilter("all");
      setQuery("");
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function select(id: string) {
    setSelected(id);
    // On phones the detail pane sits under the list — bring it into view
    if (window.matchMedia("(max-width: 767px)").matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = list.findIndex((p) => idOf(p) === selected);
    const next = list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
    if (!next) return;
    setSelected(idOf(next));
    tabRefs.current[idOf(next)]?.focus();
  }

  return (
    <EditorFile id="projects" label="Projects">
      <p className="ln ide-comment mb-3">{"<!-- projects/ -->"}</p>
      <h2 className="ln ide-h2 mb-4">
        <Mark>##</Mark>
        {sections.projects.heading}
      </h2>
      <p className="ln ide-lead mb-10">{sections.projects.intro}</p>

      <div className="qo ln">
        {/* ── Quick Open list ── */}
        <div className="qo__side">
          <label className="qo__input">
            <span className="qo__prompt" aria-hidden="true">
              &gt;
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects by name or stack"
              aria-label="Search projects"
            />
            <kbd aria-hidden="true">Ctrl+P</kbd>
          </label>

          <div className="qo__filters" role="group" aria-label="Filter projects">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="qo__filter"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="qo__count">{personalProjects.filter(f.match).length}</span>
              </button>
            ))}
          </div>

          <div className="qo__list" role="tablist" aria-orientation="vertical" aria-label="Projects" onKeyDown={onKey}>
            {list.map((p) => {
              const id = idOf(p);
              const isSel = id === selected;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab`}
                  aria-selected={isSel}
                  aria-controls={id}
                  tabIndex={isSel || (!list.some((x) => idOf(x) === selected) && p === list[0]) ? 0 : -1}
                  className="qo__item"
                  onClick={() => select(id)}
                >
                  <FileIcon kind="folder" open={isSel} />
                  <span className="qo__name">{p.title}</span>
                  <span className="qo__kind">{p.kind}</span>
                </button>
              );
            })}
            {!list.length && <p className="settings__empty">No matching projects.</p>}
          </div>
        </div>

        {/* ── Detail pane — every project stays in the DOM so all text is indexed ── */}
        <div className="qo__detail" ref={detailRef}>
          {personalProjects.map((p) => {
            const id = idOf(p);
            const slug = slugify(p.title);
            return (
              <article
                key={id}
                id={id}
                role="tabpanel"
                aria-labelledby={`${id}-tab`}
                hidden={id !== selected}
                className="qo__panel"
              >
                <div className="ide-pane__bar">
                  <FileIcon kind="md" />
                  <span className="ide-pane__bar-title">{slug}/README.md</span>
                  <span className="ide-pane__bar-right lang-badge">{p.kind}</span>
                </div>
                <div className="ide-pane__body">
                  <h3 className="ide-h2" style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.75rem)" }}>
                    <Mark>#</Mark>
                    {p.title}
                  </h3>
                  {p.platform !== p.kind && (
                    <p className="mono mt-1" style={{ fontSize: "0.72rem" }}>
                      <span className="tok-com">{"// "}</span>
                      <span className="tok-str">{p.platform}</span>
                    </p>
                  )}
                  <p className="proj-card__story mt-4" style={{ fontSize: "0.925rem" }}>
                    {p.story}
                  </p>

                  {p.screenshots && p.screenshots.length > 0 && id === selected && (
                    <div className="qo__preview">
                      <div className="ide-pane__bar">
                        <span aria-hidden="true">◫</span>
                        <span className="ide-pane__bar-title">Preview — {p.title}</span>
                      </div>
                      <ProductShowcase slides={p.screenshots} title={p.title} />
                    </div>
                  )}

                  <div className="proj-card__foot">
                    {p.tags.map((t) => (
                      <span key={t} className="ide-chip">
                        {t}
                      </span>
                    ))}
                    <ProjectLink link={p.link} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </EditorFile>
  );
}
