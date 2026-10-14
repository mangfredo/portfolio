"use client";

import { useEffect, useRef, useState } from "react";
import EditorFile, { Mark } from "./ide/EditorFile";
import { scripts, impact } from "@/content/automation";
import { sections } from "@/content/profile";

type Status = "idle" | "running" | "done";

const RUN_MS = 650; // one task
const STEP_MS = 220; // gap between tasks in "Run all"

// Automation suite shown as a task runner (automation/tasks.json)
export default function Decalogue() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [summary, setSummary] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  function run(num: string, delay = 0) {
    later(() => setStatus((s) => ({ ...s, [num]: "running" })), delay);
    later(() => setStatus((s) => ({ ...s, [num]: "done" })), delay + RUN_MS);
  }

  function runAll() {
    if (runningAll) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStatus({});
    setSummary(false);
    setRunningAll(true);
    scripts.forEach((s, i) => run(s.num, i * STEP_MS));
    const end = (scripts.length - 1) * STEP_MS + RUN_MS + 150;
    later(() => {
      setRunningAll(false);
      setSummary(true);
    }, end);
  }

  const done = scripts.filter((s) => status[s.num] === "done").length;

  return (
    <EditorFile id="automation" label="Automation">
      <p className="ln ide-comment mb-3">{"// automation/tasks.json"}</p>
      <h2 className="ln ide-h2 mb-3">
        <Mark>##</Mark>
        {sections.automation.heading}
      </h2>
      <p className="ln ide-lead mb-6">{sections.automation.intro}</p>

      <div className="ln ide-warn mb-8">
        <span className="ide-warn__icon" aria-hidden="true">
          ⚠
        </span>
        <p>{sections.automation.nda}</p>
      </div>

      <div className="ln tasks">
        <div className="tasks__bar">
          <span className="tasks__title">
            <span className="ide-ficon ide-ficon--task" aria-hidden="true">
              ▶
            </span>
            Tasks
            <span className="tasks__count">
              {done}/{scripts.length}
            </span>
          </span>
          <button type="button" className="ide-btn ide-btn--primary tasks__runall" onClick={runAll} disabled={runningAll}>
            <span aria-hidden="true">{runningAll ? "◌" : "▶▶"}</span>
            {runningAll ? "Running…" : "Run all"}
          </button>
        </div>

        <ol className="tasks__list">
          {scripts.map((s) => {
            const st = status[s.num] ?? "idle";
            return (
              <li key={s.num} className="task" data-status={st}>
                <button
                  type="button"
                  className="task__run"
                  onClick={() => run(s.num)}
                  disabled={st === "running" || runningAll}
                  aria-label={`Run ${s.name}`}
                  title="Run task"
                >
                  {st === "running" ? <span className="task__spin" aria-hidden="true" /> : st === "done" ? "✓" : "▶"}
                </button>
                <span className="task__num" aria-hidden="true">
                  {s.num}
                </span>
                <div className="min-w-0">
                  <h3 className="task__name">{s.name}</h3>
                  <p className="task__desc">{s.desc}</p>
                  {st !== "idle" && (
                    <div className="task__out" aria-live="polite">
                      <p>
                        <span className="tok-kw">&gt;</span> automation: run {s.name}
                      </p>
                      {st === "done" && <p className="task__ok">✓ Task completed</p>}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Run summary — the impact list, always present; highlighted after "Run all" */}
        <div className="tasks__summary" data-on={summary}>
          <p className="ide-comment mb-3">{`// ${sections.automation.impactLabel}`}</p>
          <ul className="impact">
            {impact.map((item) => (
              <li key={item} className="impact__item">
                <span className="impact__check" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </EditorFile>
  );
}
