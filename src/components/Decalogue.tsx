const scripts = [
  { num: "01", name: "Smart Jira Workflow Automator", desc: "Automates ticket status transitions and assignee updates based on comment input, reducing manual QA/Dev handoffs." },
  { num: "02", name: "QA Tool Auto-Population", desc: "Extracts data from Jira tickets and pre-fills QA Tool forms, minimizing manual input and reducing data entry errors." },
  { num: "03", name: "Jira Quick Access Integration", desc: "Injects shortcuts to open Lifeguard and QA tools with pre-filled ticket data, eliminating repetitive setup steps." },
  { num: "04", name: "Silkroad Folder Navigator", desc: "Adds direct navigation and persistent highlighting for deeply nested file structures, reducing search time." },
  { num: "05", name: "403 Error Auto-Fix Script", desc: "Automatically cleans malformed URLs in ePrise to prevent access errors without manual correction." },
  { num: "06", name: "ePrise Workflow Shortcuts", desc: "Overrides default browser actions with system-specific shortcuts (publish, refresh, comment wrapping) to streamline development tasks." },
  { num: "07", name: "Context-Aware Comment Actions", desc: "Adds intelligent action triggers to comment workflows based on user input and ticket state, reducing manual steps." },
  { num: "08", name: "Targeted Search & Highlight", desc: "Dynamically highlights and locates relevant elements within large UI structures, improving visibility and traceability." },
  { num: "09", name: "Environment-Aware Navigation", desc: "Adapts tool behavior based on staging/production context, reducing risk of incorrect environment usage." },
  { num: "10", name: "UI Behavior Enhancements", desc: "Injects UI improvements into legacy systems to improve responsiveness, usability, and interaction speed." },
  { num: "11", name: "Database Batch Uploader", desc: "Automates bulk page uploads to the internal database. Handled a 300-page upload in under an hour — a task that would have taken an entire shift manually." },
];

const impact = [
  "Reduced repetitive manual steps across multiple workflows",
  "Improved speed of ticket handling and QA preparation",
  "Minimized human error in navigation, data entry, and status updates",
  "Tools actively used within team workflows",
];

export default function Decalogue() {
  return (
    <section id="automation" className="py-20 sm:py-32 px-6 sm:px-10">
      <div style={{ maxWidth: "1120px", marginInline: "auto" }}>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-0 mb-16" aria-hidden="false">
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span
            className="px-3 font-mono"
            style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
          >
            — 04 · automation —
          </span>
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
        </div>

        <h2
          className="mb-3"
          style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: 500 }}
        >
          Workflow Automation Systems
        </h2>
        <p className="mb-4" style={{ color: "var(--ink-soft)", fontSize: "1rem", lineHeight: 1.7 }}>
          Built at Rival HR — a collection of production-used browser automation
          scripts that eliminate repetitive QA and development tasks.
        </p>

        {/* NDA notice */}
        <div className="bp-nda mb-12">
          <span style={{ flexShrink: 0 }} aria-hidden="true">🔒</span>
          <p>
            These tools were developed under NDA for internal use. Source code
            and live demos cannot be shared publicly.
          </p>
        </div>

        {/* ── Script list — hairline rows, not cards ── */}
        <div className="border-t" style={{ borderColor: "var(--line)" }}>
          {scripts.map((s) => (
            <div
              key={s.num}
              className="flex gap-5 py-4 border-b"
              style={{ borderColor: "var(--line)" }}
            >
              <span
                className="font-mono flex-shrink-0"
                style={{
                  fontSize: "0.72rem",
                  color: "var(--accent-2)",
                  letterSpacing: "0.06em",
                  paddingTop: "2px",
                  minWidth: "2rem",
                }}
              >
                {s.num}
              </span>
              <div>
                <h3
                  className="font-mono mb-1"
                  style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)" }}
                >
                  {s.name}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Impact ── */}
        <div className="mt-12">
          {/* Inline divider label */}
          <div className="flex items-center gap-0 mb-6" aria-hidden="true">
            <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
            <span
              className="px-3 font-mono"
              style={{ fontSize: "0.68rem", letterSpacing: "0.12em", color: "var(--ink-soft)", textTransform: "uppercase", flexShrink: 0 }}
            >
              IMPACT
            </span>
            <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          </div>

          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
            {impact.map((item) => (
              <p
                key={item}
                className="bp-impact-item"
                style={{ fontSize: "0.875rem" }}
              >
                <span style={{ color: "var(--accent-2)", flexShrink: 0 }} aria-hidden="true">✓</span>
                {item}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
