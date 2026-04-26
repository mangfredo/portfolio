const scripts = [
  { num: "01", name: "Smart Jira Workflow Automation", desc: "Automates ticket transitions and assignments based on comment context, reducing manual status updates and improving workflow consistency." },
  { num: "02", name: "QA Tool Auto-Population", desc: "Extracts data from Jira tickets and pre-fills QA Tool forms, minimizing manual input and reducing data entry errors." },
  { num: "03", name: "Lifeguard Quick Access Integration", desc: "Adds direct access buttons from Jira to staging/production environments with pre-configured parameters for faster debugging." },
  { num: "04", name: "Silkroad Folder Navigator", desc: "Simplifies navigation through complex directory structures by highlighting and locating files instantly within the UI." },
  { num: "05", name: "403 Error Auto-Fix Script", desc: "Automatically cleans malformed URLs to prevent access errors, eliminating manual correction steps." },
  { num: "06", name: "ePrise Workflow Shortcuts", desc: "Overrides default browser actions with system-specific shortcuts (publish, refresh, comment wrapping) to streamline development tasks." },
  { num: "07", name: "Context-Aware Comment Actions", desc: "Enhances comment workflows by introducing intelligent action triggers based on user input and ticket state." },
  { num: "08", name: "Targeted Search & Highlight System", desc: "Improves visibility and traceability of elements within large UI structures by dynamically highlighting relevant nodes." },
  { num: "09", name: "Environment-Aware Navigation Tools", desc: "Adapts behavior based on staging/production context, reducing risk of incorrect environment usage." },
  { num: "10", name: "UI Behavior Enhancements", desc: "Improves responsiveness and usability of legacy systems through injected UI improvements and interaction optimizations." },
];

export default function Decalogue() {
  return (
    <section id="scripts" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Internal Tools</p>
        <h2 className="text-4xl font-bold mb-5">Workflow Automation Systems</h2>
        <p className="text-lg mb-14 max-w-3xl" style={{ color: "var(--muted)" }}>
          A collection of browser-based automation tools designed to eliminate repetitive tasks, reduce manual errors, and accelerate internal development and QA workflows.
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

        {/* Impact Summary */}
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
