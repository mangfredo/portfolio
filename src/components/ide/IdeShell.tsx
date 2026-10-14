"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Files,
  GitBranch,
  Lightning,
  Briefcase,
  EnvelopeSimple,
  List,
  X,
  MagnifyingGlass,
  CaretRight,
  CaretDown,
  TerminalWindow,
} from "@phosphor-icons/react";
import ThemeToggle from "../ThemeToggle";
import FileIcon from "./FileIcon";
import TerminalPanel, { type PanelState } from "./TerminalPanel";
import { files } from "./files";
import { profile } from "@/content/profile";

const sectionIds = files.map((f) => f.id);
const lastId = sectionIds[sectionIds.length - 1];

const activity = [
  { id: "experience", label: "Experience (git log)", Icon: GitBranch },
  { id: "work", label: "War stories", Icon: Briefcase },
  { id: "automation", label: "Automation — tasks", Icon: Lightning },
  { id: "contact", label: "Contact", Icon: EnvelopeSimple },
];

/** Other components open/close the docked terminal through this event */
export const TERMINAL_EVENT = "ide:terminal";

export default function IdeShell({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("top");
  const [explorer, setExplorer] = useState(true); // desktop sidebar
  const [drawer, setDrawer] = useState(false); // mobile drawer
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ work: true, projects: false });
  const [panel, setPanel] = useState<PanelState>("collapsed");
  const [panelHeight, setPanelHeight] = useState(34);
  const tabsRef = useRef<HTMLDivElement>(null);
  const clickLock = useRef(0); // timer id while a tab/file click holds the selection
  const pinned = useRef(false); // user opened the terminal themselves — stop auto-collapsing

  // Terminal starts open on desktop, collapsed on phones
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const raf = requestAnimationFrame(() => setPanel("open"));
    return () => cancelAnimationFrame(raf);
  }, []);

  const changePanel = useCallback((s: PanelState) => {
    if (s !== "collapsed") pinned.current = true;
    setPanel(s);
  }, []);

  // Scroll spy — the section crossing the upper third of the viewport is "open".
  // The short final section can never reach that band, so it wins as soon as
  // it is fully on screen.
  useEffect(() => {
    const pick = () => {
      if (clickLock.current) return;
      // Look sections up on every check: holding on to elements breaks when a
      // section is re-mounted (a detached node reports a 0×0 rect)
      const els = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
      const last = els[els.length - 1];
      if (last && last.getBoundingClientRect().bottom <= window.innerHeight + 2) {
        setActive(lastId);
        return;
      }
      const band = window.innerHeight * 0.32;
      let current = sectionIds[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top - band <= 0) current = el.id;
      }
      setActive(current);
    };

    // A tab/file click holds its selection until the smooth scroll settles
    const release = () => {
      if (!clickLock.current) return;
      window.clearTimeout(clickLock.current);
      clickLock.current = 0;
      pick();
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("scrollend", release);
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("scrollend", release);
      window.removeEventListener("resize", pick);
    };
  }, []);

  // Collapse the terminal once the reader moves past the Welcome page (unless they opened it)
  useEffect(() => {
    if (active !== "top" && !pinned.current) setPanel((p) => (p === "open" ? "collapsed" : p));
  }, [active]);

  // Ctrl+` toggles the terminal, like VS Code; other components can dispatch TERMINAL_EVENT
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Backquote") {
        e.preventDefault();
        setPanel((p) => {
          const next = p === "collapsed" ? "open" : "collapsed";
          if (next === "open") pinned.current = true;
          return next;
        });
      }
    };
    const onOpen = () => changePanel("open");
    window.addEventListener("keydown", onKey);
    window.addEventListener(TERMINAL_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(TERMINAL_EVENT, onOpen);
    };
  }, [changePanel]);

  // Keep the active tab visible in the tab strip without scrolling the page
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = strip?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!strip || !tab) return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollTo({ left: left - 8, behavior: "smooth" });
    else if (right > strip.scrollLeft + strip.clientWidth)
      strip.scrollTo({ left: right - strip.clientWidth + 8, behavior: "smooth" });
  }, [active]);

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  // Clicking a tab or file marks it open right away instead of waiting for the scroll
  function openFile(id: string) {
    window.clearTimeout(clickLock.current);
    // Released by "scrollend"; the timer is a fallback for browsers without it
    clickLock.current = window.setTimeout(() => (clickLock.current = 0), 2500);
    setActive(id);
  }

  const current = files.find((f) => f.id === active) ?? files[0];

  return (
    <div className="ide-root" data-explorer={explorer}>
      {/* ── Title bar ── */}
      <header className="ide-title">
        <button
          type="button"
          className="ide-icon-btn ide-burger"
          onClick={() => setDrawer((o) => !o)}
          aria-label={drawer ? "Close file explorer" : "Open file explorer"}
          aria-expanded={drawer}
          aria-controls="ide-explorer"
        >
          {drawer ? <X size={16} /> : <List size={16} />}
        </button>

        <a href="#top" className="ide-title__brand" onClick={() => openFile("top")}>
          <span className="ide-title__logo" aria-hidden="true">T</span>
          <span>{profile.shortName}</span>
        </a>

        <nav className="ide-title__menu" aria-label="Sections">
          {files.slice(1).map((f) => (
            <a key={f.id} href={`#${f.id}`} onClick={() => openFile(f.id)}>
              {f.id === "work" ? "Work" : f.id.charAt(0).toUpperCase() + f.id.slice(1)}
            </a>
          ))}
        </nav>

        <div className="ide-title__search">
          <a href="#top" aria-label="Back to top" onClick={() => openFile("top")}>
            <MagnifyingGlass size={12} aria-hidden="true" />
            <span className="truncate">tristan-sereno — {current.name}</span>
          </a>
        </div>

        <div className="ide-title__actions">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="ide-icon-btn"
          >
            LinkedIn ↗
          </a>
          <ThemeToggle variant="icon" />
        </div>
      </header>

      {/* ── Activity bar (desktop) ── */}
      <aside className="ide-activity" aria-label="Activity bar">
        <button
          type="button"
          className="ide-activity__btn"
          data-active={explorer}
          onClick={() => setExplorer((o) => !o)}
          aria-label={explorer ? "Hide explorer" : "Show explorer"}
          aria-pressed={explorer}
          title="Explorer"
        >
          <Files size={22} />
        </button>
        {activity.map(({ id, label, Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="ide-activity__btn"
            data-active={active === id}
            aria-label={label}
            title={label}
            onClick={() => openFile(id)}
          >
            <Icon size={22} />
          </a>
        ))}
        <span className="ide-activity__spacer" />
      </aside>

      {/* ── Explorer ── */}
      {drawer && <div className="ide-scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}
      <aside id="ide-explorer" className="ide-explorer" data-open={drawer} aria-label="File explorer">
        <div className="ide-explorer__head">
          <span>Explorer</span>
          <span aria-hidden="true">···</span>
        </div>
        <div className="ide-explorer__root">
          <CaretDown size={10} aria-hidden="true" /> Portfolio
        </div>
        <nav className="ide-tree" aria-label="Portfolio files">
          <ul>
            {files.map((f) => {
              const isFolder = !!f.children;
              const open = !!openFolders[f.id];
              return (
                <li key={f.id}>
                  <div className="flex items-center">
                    <a
                      href={`#${f.id}`}
                      className="ide-tree__item flex-1"
                      style={{ paddingLeft: "0.9rem" }}
                      data-active={active === f.id}
                      aria-current={active === f.id ? "location" : undefined}
                      onClick={() => {
                        setDrawer(false);
                        openFile(f.id);
                        if (isFolder) setOpenFolders((s) => ({ ...s, [f.id]: true }));
                      }}
                    >
                      {isFolder ? (
                        <span
                          className="ide-tree__caret"
                          aria-hidden="true"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenFolders((s) => ({ ...s, [f.id]: !open }));
                          }}
                        >
                          {open ? <CaretDown size={10} /> : <CaretRight size={10} />}
                        </span>
                      ) : (
                        <span className="ide-tree__caret" aria-hidden="true" />
                      )}
                      <FileIcon kind={f.kind} />
                      <span className="truncate">{f.name}</span>
                    </a>
                  </div>
                  {isFolder && open && (
                    <ul>
                      {f.children!.map((c) => (
                        <li key={c.id}>
                          <a
                            href={`#${c.id}`}
                            className="ide-tree__item"
                            style={{ paddingLeft: "2.35rem" }}
                            onClick={() => {
                              setDrawer(false);
                              openFile(f.id);
                            }}
                          >
                            <FileIcon kind={c.kind} />
                            <span className="truncate">{c.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ide-explorer__foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </aside>

      {/* ── Editor group ── */}
      <div className="ide-main" style={{ paddingBottom: `calc(var(--ide-status) + ${panelHeight}px)` }}>
        <div className="ide-tabs" ref={tabsRef} role="navigation" aria-label="Open files">
          {files.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="ide-tab"
              data-tab={f.id}
              data-active={active === f.id}
              aria-current={active === f.id ? "location" : undefined}
              onClick={() => openFile(f.id)}
            >
              <FileIcon kind={f.kind} />
              {f.name}
              <span className="ide-tab__close" aria-hidden="true">
                ×
              </span>
            </a>
          ))}
        </div>

        <div className="ide-crumbs" aria-hidden="true">
          {current.path.map((p, i) => (
            <span key={p} className="flex items-center gap-1.5">
              {i > 0 && <span className="ide-crumbs__sep">›</span>}
              <span className={i === current.path.length - 1 ? "ide-crumbs__cur" : undefined}>{p}</span>
            </span>
          ))}
        </div>

        <main>{children}</main>
      </div>

      {/* ── Docked terminal ── */}
      <TerminalPanel state={panel} onState={changePanel} onHeight={setPanelHeight} />

      {/* ── Status bar ── */}
      <footer className="ide-status" aria-label="Status bar">
        <span className="ide-status__item">
          <GitBranch size={12} aria-hidden="true" /> main
        </span>
        <a href="#contact" className="ide-status__item" onClick={() => openFile("contact")}>
          <span className="ide-status__dot" aria-hidden="true" /> Open to work
        </a>
        <span className="ide-status__item ide-status__opt">{profile.location}</span>
        <span className="ide-status__spacer" />
        <button
          type="button"
          className="ide-status__item"
          onClick={() => changePanel(panel === "collapsed" ? "open" : "collapsed")}
          aria-label={panel === "collapsed" ? "Open terminal" : "Hide terminal"}
          title="Toggle terminal (Ctrl+`)"
        >
          <TerminalWindow size={12} aria-hidden="true" /> Terminal
        </button>
        <span className="ide-status__item ide-status__opt">UTF-8</span>
        <span className="ide-status__item">{current.language}</span>
      </footer>
    </div>
  );
}
