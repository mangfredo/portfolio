const projects = [
  {
    title: "The Offer Letter Automation Engine",
    problem: "A 6-hour manual documentation and offer letter process prone to human error.",
    solution: "A high-precision parsing engine built with Node.js and PostgreSQL. Implemented strict-rule validation logic to handle complex edge cases in employment contracts.",
    result: "Reduced execution time from 6 hours to under 10 minutes.",
    impact: "Architected with such high integrity that the CTO and Director of Engineering adopted the core logic for integration into the company's flagship self-service product.",
    tags: ["Node.js", "PostgreSQL", "Parsing Engine", "Validation"],
    metric: "97%+",
    metricLabel: "time reduction",
  },
  {
    title: "Enterprise Workflow Extension",
    problem: "Gap between internal legacy systems and modern web interfaces causing friction and data lag.",
    solution: "A browser-integrated tool designed to bridge legacy systems with modern web UIs, with focus on UI/UX optimization and real-time data synchronization.",
    result: "Seamless real-time sync between legacy and modern platforms.",
    impact: "Led development end-to-end as Lead Developer.",
    tags: ["Browser Extension", "UI/UX", "Real-time Sync", "Legacy Integration"],
    metric: "Lead",
    metricLabel: "developer",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 px-8" style={{ background: "color-mix(in srgb, var(--card-bg) 30%, transparent)" }}>
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Projects</p>
        <h2 className="text-4xl font-bold mb-14">Core Enterprise Work</h2>

        <div className="grid gap-10">
          {projects.map((p) => (
            <article key={p.title} className="rounded-xl p-10 border transition-colors" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="shrink-0 w-28 h-28 rounded-xl flex flex-col items-center justify-center border" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                  <span className="sel-invert text-3xl font-bold" style={{ color: "var(--accent)" }}>{p.metric}</span>
                  <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{p.metricLabel}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4">{p.title}</h3>
                  <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                    <p><span className="font-medium" style={{ color: "var(--foreground)" }}>Problem:</span> {p.problem}</p>
                    <p><span className="font-medium" style={{ color: "var(--foreground)" }}>Solution:</span> {p.solution}</p>
                    <p><span className="font-medium" style={{ color: "var(--foreground)" }}>Result:</span> {p.result}</p>
                    <p><span className="font-medium" style={{ color: "var(--foreground)" }}>Impact:</span> {p.impact}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    {p.tags.map((t) => (
                      <span key={t} className="sel-invert px-3 py-1.5 text-sm font-mono rounded border" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 5%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
