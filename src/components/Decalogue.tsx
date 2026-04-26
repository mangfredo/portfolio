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
];

export default function Decalogue() {
  return (
    <section id="scripts" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Internal Tools</p>
        <h2 className="text-4xl font-bold mb-5">Workflow Automation Systems</h2>
        <p className="text-lg mb-14 max-w-3xl" style={{ color: "var(--muted)" }}>
          Browser-based automation tools built to eliminate repetitive tasks, reduce manual errors, and speed up internal development and QA workflows.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {scripts.map((s) => (
            <div key={s.num} className="flex gap-5 p-6 rounded-lg border transition-colors" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <span className="sel-invert font-mono text-3xl font-bold leading-none" style={{ color: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>{s.num}</span>
              <div>
                <h3 className="font-semibold text-base mb-2">{s.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-xl border" style={{ background: "color-mix(in srgb, var(--accent) 5%, var(--card-bg))", borderColor: "color-mix(in srgb, var(--accent) 15%, transparent)" }}>
          <p className="sel-invert font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>Impact Summary</p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {[
              "Reduced repetitive manual steps across multiple workflows",
              "Improved speed of ticket handling and QA preparation",
              "Minimized human error in navigation, data entry, and status updates",
              "Tools actively used within team workflows",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm" style={{ color: "var(--muted)" }}>
                <span style={{ color: "var(--accent)" }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
