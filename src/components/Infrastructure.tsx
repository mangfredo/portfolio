const infra = [
  { icon: "⚡", label: "Internet", value: "500Mbps+ Redundant Fiber" },
  { icon: "🤖", label: "Workflow", value: "AI-Augmented Development (TDD, Clean Architecture)" },
  { icon: "🌏", label: "Location", value: "Philippines (Remote) — Global Timezone Overlap" },
];

export default function Infrastructure() {
  return (
    <section id="infrastructure" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Infrastructure</p>
        <h2 className="text-4xl font-bold mb-14">Technical Setup</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {infra.map((item) => (
            <div key={item.label} className="fade-in-up p-8 rounded-xl border text-center" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <div className="text-4xl mb-4" role="img" aria-label={item.label}>{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
