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

export default function Decalogue() {
  return (
    <section id="automation" className="relative py-28 sm:py-36 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <p className="sel-invert annotation mb-4">Automation</p>
        <h2
          className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Workflow Automation Systems
        </h2>
        <p className="text-base mb-4" style={{ color: "var(--fg-muted)" }}>
          Built at Rival HR — a collection of production-used browser automation
          scripts that eliminate repetitive QA and development tasks.
        </p>

        {/* NDA notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-lg border mb-12"
          style={{
            borderColor: "color-mix(in srgb, var(--fg-muted) 15%, transparent)",
            background: "color-mix(in srgb, var(--bg) 60%, var(--card-bg))",
          }}
        >
          <span className="text-sm select-none" style={{ color: "var(--fg-muted)" }}>
            🔒
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            These tools were developed under NDA for internal use. Source code
            and live demos cannot be shared publicly.
          </p>
        </div>

        {/* Two-column list — not cards, more like a manifest */}
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 reveal-stagger">
          {scripts.map((s) => (
            <div key={s.num} className="reveal flex gap-4">
              <span
                className="shrink-0 font-mono text-xs mt-1.5"
                style={{ color: "var(--accent)" }}
              >
                {s.num}
              </span>
              <div>
                <h3 className="text-base font-medium mb-1">{s.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Impact — horizontal rule style */}
        <div className="mt-16">
          <div className="hr-char font-mono text-xs tracking-wider">IMPACT</div>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {[
              "Reduced repetitive manual steps across multiple workflows",
              "Improved speed of ticket handling and QA preparation",
              "Minimized human error in navigation, data entry, and status updates",
              "Tools actively used within team workflows",
            ].map((item) => (
              <p key={item} className="flex gap-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent-bright)" }}>✓</span> {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
