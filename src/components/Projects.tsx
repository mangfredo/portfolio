const projects = [
  {
    title: "The Offer Letter Automation Engine",
    problem: "Offer letter development was a 6-hour manual process, repetitive and prone to human error.",
    solution: "Built a parsing engine in Node.js backed by PostgreSQL that takes a Word document containing contract details, extracts the content, applies strict validation rules, and generates production-ready JavaScript — handling complex edge cases across multiple countries and employment types.",
    result: "Code generation completes in roughly 10 seconds. The full end-to-end process — from template input to deployable output — takes under 10 minutes, down from 6 hours.",
    impact: "The company's CTO and Director of Engineering adopted the core logic for integration into the flagship self-service product.",
    tags: ["Node.js", "PostgreSQL", "Parsing Engine", "Validation"],
    metric: "97%+",
    metricLabel: "time reduction",
    techNotes: null,
    nda: "Due to confidentiality, only a demonstration of the tool's workflow is shown — illustrating how it converts document specs into production-ready code.",
    video: "/offer_letter_tool_demo.mp4",
    link: null,
  },
  {
    title: "Enterprise Workflow Automation Suite",
    problem: "Manual navigation, fragmented internal tools, and repetitive workflows slowing down development and QA processes.",
    solution: "Developed a suite of browser-based automation scripts (Tampermonkey) to streamline navigation, automate Jira workflows, and integrate internal tools into a unified workflow.",
    result: "Reduced repetitive manual steps and improved developer and QA efficiency across daily operations.",
    impact: "Independently designed and deployed automation solutions used by the team.",
    tags: ["JavaScript", "Tampermonkey", "DOM Manipulation", "Browser Automation"],
    metric: "10+",
    metricLabel: "tools built",
    techNotes: [
      "Built using JavaScript (Tampermonkey environment)",
      "DOM manipulation and event interception",
      "Handles lazy-loaded elements and dynamic content rendering",
      "Designed for compatibility with existing enterprise tools without backend changes",
    ],
    nda: null,
    video: null,
    link: { href: "#scripts", label: "See all tools →" },
  },
  {
    title: "Smart Quote Replacer — VS Code Extension",
    problem: "Certain client-facing contract and form JavaScript files required strict special formatting rules for quotation marks (straight, curly, and styled single/double quotes). For example, clients like Apple require specific typographic quotation standards, and inconsistencies were causing rendering issues and increasing manual review effort.",
solution: "Developed a VS Code extension that intelligently replaces escaped quotes with context-aware typographic equivalents. It evaluates surrounding characters to determine correct opening and closing quotation marks, and supports preview mode plus right-click context menu actions for quick fixes.",
result: "Removed the need for manual quote correction across contract files, saving approximately up to an hour per file depending on complexity and number of occurrences. It also improved QA efficiency by enabling validation of missing or incorrect quote replacements directly within the workflow.",
impact: "Adopted as a multi-role tool used by both developers and QA engineers, and integrated into the team’s daily development and review process.",
    tags: ["VS Code Extension", "JavaScript", "Regex", "Developer Tooling"],
    metric: "v2.2",
    metricLabel: "current",
    techNotes: [
      "Context-aware single quote replacement (open vs close detection)",
      "Double quote replacement inside .html() jQuery calls",
      "Right-click context menu for wrap/replace operations",
      "Preview mode to review changes before applying",
    ],
    nda: null,
    video: "/smart_quote_replacer_demo.mp4",
    link: null,
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>Projects</p>
        <h2 className="text-4xl font-bold mb-14">Core Enterprise Initiatives</h2>

        <div className="grid gap-10">
          {projects.map((p) => (
            <article key={p.title} className="fade-in-up rounded-xl p-10 border transition-colors" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
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

                  {p.techNotes && (
                    <div className="mt-5 p-4 rounded-lg border" style={{ background: "color-mix(in srgb, var(--card-bg) 50%, var(--background))", borderColor: "var(--card-border)" }}>
                      <p className="sel-invert text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>Technical Notes</p>
                      <ul className="space-y-1.5">
                        {p.techNotes.map((note) => (
                          <li key={note} className="text-sm flex gap-2" style={{ color: "var(--muted)" }}>
                            <span style={{ color: "var(--accent)" }}>›</span> {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-5">
                    {p.tags.map((t) => (
                      <span key={t} className="sel-invert px-3 py-1.5 text-sm font-mono rounded border" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 5%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.nda && (
                    <div className="mt-5 flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: "color-mix(in srgb, var(--muted) 20%, transparent)", background: "color-mix(in srgb, var(--card-bg) 60%, var(--background))" }}>
                      <span className="text-base select-none" style={{ color: "var(--muted)" }}>🔒</span>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{p.nda}</p>
                    </div>
                  )}

                  {p.video && (
                    <div className="mt-6 rounded-lg overflow-hidden border" style={{ borderColor: "var(--card-border)" }}>
                      <video autoPlay muted loop playsInline className="w-full">
                        <source src={p.video} type="video/mp4" />
                      </video>
                    </div>
                  )}

                  {p.link && (
                    <a
                      href={p.link.href}
                      className="sel-invert inline-flex items-center gap-1.5 mt-5 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--accent)" }}
                    >
                      {p.link.label}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
