"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretDown, CaretUp, CornersIn, CornersOut } from "@phosphor-icons/react";
import Terminal from "../Terminal";
import { hero } from "@/content/profile";

export type PanelState = "open" | "collapsed" | "max";

const BAR = 34; // collapsed height = the tab bar
const MIN = 160;

// VS Code-style bottom panel, docked above the status bar for the whole page
export default function TerminalPanel({
  state,
  onState,
  onHeight,
}: {
  state: PanelState;
  onState: (s: PanelState) => void;
  /** Reports the visible height so the page can pad its bottom */
  onHeight: (px: number) => void;
}) {
  const [size, setSize] = useState(300);
  const [resizing, setResizing] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const drag = useRef<{ y: number; h: number } | null>(null);

  // Start the typing animation shortly after the panel is first opened
  useEffect(() => {
    if (started || state === "collapsed") return;
    const t = setTimeout(() => setStarted(true), 900);
    return () => clearTimeout(t);
  }, [state, started]);

  const maxHeight = useCallback(() => window.innerHeight - 38 - 24 - 48, []);

  const height = state === "collapsed" ? BAR : state === "max" ? null : size;

  useEffect(() => {
    const report = () => onHeight(height ?? maxHeight());
    report();
    window.addEventListener("resize", report);
    return () => window.removeEventListener("resize", report);
  }, [height, onHeight, maxHeight]);

  function onPointerDown(e: React.PointerEvent) {
    if (state === "collapsed") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, h: height ?? maxHeight() };
    setResizing(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const next = Math.min(maxHeight(), Math.max(MIN, drag.current.h + (drag.current.y - e.clientY)));
    setSize(next);
    if (state === "max") onState("open");
  }

  function onPointerUp() {
    drag.current = null;
    setResizing(false);
  }

  const collapsed = state === "collapsed";

  return (
    <section
      className="ide-panel"
      data-state={state}
      data-resizing={resizing}
      style={{ height: height ?? `calc(100vh - 38px - 24px - 48px)` }}
      aria-label="Terminal panel"
    >
      <div
        className="ide-panel__resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden="true"
      />

      <div className="ide-panel__bar">
        <span className="ide-panel__tab" aria-hidden="true">
          Problems
        </span>
        <span className="ide-panel__tab" aria-hidden="true">
          Output
        </span>
        <button
          type="button"
          className="ide-panel__tab"
          data-active="true"
          onClick={() => onState(collapsed ? "open" : "collapsed")}
          aria-expanded={!collapsed}
        >
          Terminal
        </button>

        <span className="ide-panel__hint" data-on={done && !collapsed}>
          {"// "}
          {hero.terminalNote.replace(/^↑\s*/, "")} · <b>{hero.terminalHint.replace(/\s*↑$/, "")}</b>
        </span>

        <div className="ide-panel__actions">
          {!collapsed && (
            <button
              type="button"
              className="ide-icon-btn"
              onClick={() => onState(state === "max" ? "open" : "max")}
              aria-label={state === "max" ? "Restore panel size" : "Maximize panel"}
              title={state === "max" ? "Restore" : "Maximize"}
            >
              {state === "max" ? <CornersIn size={14} /> : <CornersOut size={14} />}
            </button>
          )}
          <button
            type="button"
            className="ide-icon-btn"
            onClick={() => onState(collapsed ? "open" : "collapsed")}
            aria-label={collapsed ? "Open terminal (Ctrl+`)" : "Hide terminal (Ctrl+`)"}
            title={collapsed ? "Open (Ctrl+`)" : "Hide (Ctrl+`)"}
          >
            {collapsed ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </button>
        </div>
      </div>

      <div className="ide-panel__body">
        <Terminal fill startTyping={started} onComplete={() => setDone(true)} />
      </div>
    </section>
  );
}
