const scripts = [
  { num: "01", name: "Strict-Rule Parser", desc: "Core logic behind the Offer Letter Tool — validates and extracts data from unstructured sources with zero margin for error." },
  { num: "02", name: "Fix 403 Error (Auto URL Cleanup)", desc: "Automatically removes invalid URL parameters, preventing 403 errors and eliminating manual fixes." },
  { num: "03", name: "Silkroad Folder Navigator", desc: "Instantly locates and highlights files in complex folder structures, reducing navigation time and errors." },
  { num: "04", name: "Jira to Lifeguard Quick Access", desc: "Opens Lifeguard pre-filled from Jira tickets, cutting down repetitive setup steps." },
  { num: "05", name: "Jira to QA Tool Quick Access", desc: "Auto-creates QA tickets with pre-filled data, minimizing manual entry and improving accuracy." },
  { num: "06", name: "Jira Smart Comment Actions", desc: "Automates ticket assignment and status transitions based on comments, speeding up workflows." },
  { num: "07", name: "ePrise Shortcut Override", desc: "Replaces browser shortcuts with ePrise actions, enabling faster work without session interruptions." },
  { num: "08", name: "Event Categories Bulk Search", desc: "Returns multiple category IDs instantly, reducing lookup time from 30 minutes to seconds." },
  { num: "09", name: "ePrise Display Version Badge", desc: "Shows the active form version on-screen, eliminating the need to manually verify versions." },
  { num: "10", name: "Add Name Verification", desc: "Automates adding fields and required code across ceForm, Includes, and AdditionalIncludesPC, reducing repetitive setup." },
];

export default function Decalogue() {
  return (
    <section id="scripts" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Scripts</p>
        <h2 className="text-4xl font-bold mb-5">The Automation Decalogue</h2>
        <p className="text-lg mb-14 max-w-2xl" style={{ color: "var(--muted)" }}>
          10 high-impact scripts designed to eliminate manual overhead and optimize workflow efficiency.
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
      </div>
    </section>
  );
}
