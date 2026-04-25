const scripts = [
  { num: "01", name: "Strict-Rule Parser", desc: "Core logic behind the Offer Letter Tool — validates and extracts data from unstructured sources with zero margin for error." },
  { num: "02", name: "Legacy Data Migrator", desc: "Automates transfer of sensitive records from old database schemas to PostgreSQL without data loss." },
  { num: "03", name: "Offer Lifecycle Automator", desc: "Manages state transitions of documents from generation to digital signature." },
  { num: "04", name: "Schema Validator", desc: "Ensures all incoming data packets meet strict TypeScript-defined interfaces before hitting the database." },
  { num: "05", name: "Environment Sync Tool", desc: "Automates configuration of local, staging, and production environments for the engineering team." },
  { num: "06", name: "Dependency Auditor", desc: "Identifies and flags deprecated or vulnerable packages across multiple microservices." },
  { num: "07", name: "Auto-Documentation Generator", desc: "Extracts logic patterns from code to generate real-time technical documentation for stakeholders." },
  { num: "08", name: "Bulk Notification Dispatcher", desc: "High-throughput script for managing asynchronous user communications via API." },
  { num: "09", name: "Error Log Aggregator", desc: "Parses system logs to identify and categorize recurring production bottlenecks." },
  { num: "10", name: "Productivity Monitor", desc: "Tracks script execution times and identifies wait-states in the CI/CD pipeline." },
];

export default function Decalogue() {
  return (
    <section id="scripts" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Scripts</p>
        <h2 className="text-4xl font-bold mb-5">The Automation Decalogue</h2>
        <p className="text-lg mb-14 max-w-2xl" style={{ color: "var(--muted)" }}>
          10 high-impact scripts designed to eliminate manual overhead and optimize system performance.
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
