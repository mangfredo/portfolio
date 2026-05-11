import ScreenshotCarousel from "./ScreenshotCarousel";

const projects = [
  {
    num: "01",
    title: "The Offer Letter Engine",
    why: "I was watching a colleague spend an entire afternoon manually converting a Word document into JavaScript. Same structure every time, same rules, same mistakes. I thought: this should take seconds, not hours.",
    story:
      "Built a parsing engine in Node.js backed by PostgreSQL that takes a Word document containing contract details, extracts the content, applies strict validation rules, and generates production-ready JavaScript — handling complex edge cases across multiple countries and employment types. Code generation completes in roughly 10 seconds. The full end-to-end process takes under 10 minutes, down from 6 hours.",
    aftermath:
      "The company's CTO and Director of Engineering is planning the core logic for integration into the flagship self-service product.",
    tags: ["Node.js", "PostgreSQL", "Parsing Engine", "Validation"],
    metric: "97%+",
    metricLabel: "time saved",
    nda: "Due to confidentiality, only a demonstration of the tool's workflow is shown — illustrating how it converts document specs into production-ready code.",
    video: "/offer_letter_tool_demo.mp4",
    link: null,
  },
  {
    num: "02",
    title: "Enterprise Workflow Automation Suite",
    why: "Every developer on the team was doing the same 15-click dance through Jira, QA tools, and internal systems — multiple times a day. Nobody questioned it because 'that's just how it works.' I questioned it.",
    story:
      "Developed a suite of browser-based automation scripts (Tampermonkey) to streamline navigation, automate Jira workflows, and integrate internal tools into a unified workflow. DOM manipulation, event interception, handling lazy-loaded elements and dynamic content — all designed to work with existing enterprise tools without any backend changes.",
    aftermath:
      "Independently designed and deployed. Actively used across the team — saving an estimated 2–3 hours of dev time per day when used consistently.",
    tags: ["JavaScript", "Tampermonkey", "DOM Manipulation", "Browser Automation"],
    metric: "10+",
    metricLabel: "tools built",
    nda: null,
    video: null,
    link: { href: "#automation", label: "See all tools" },
  },
  {
    num: "03",
    title: "Smart Quote Replacer — VS Code Extension",
    why: "Contract files needed specific typographic quotation marks — straight, curly, styled. Getting them wrong caused rendering issues. Getting them right by hand was tedious and error-prone. So I built an extension that does it automatically.",
    story:
      "A VS Code extension that intelligently replaces escaped quotes with context-aware typographic equivalents. It evaluates surrounding characters to determine correct opening and closing quotation marks, supports preview mode, and adds right-click context menu actions for quick fixes.",
    aftermath:
      "Adopted as a multi-role tool used by both developers and QA engineers, integrated into the team's daily development and review process. Currently on v2.2.",
    tags: ["VS Code Extension", "JavaScript", "Regex", "Developer Tooling"],
    metric: "v2.2",
    metricLabel: "current",
    nda: null,
    video: "/smart_quote_replacer_demo.mp4",
    link: null,
  },
];

export default function Projects() {
  return (
    <section id="work" className="relative py-20 sm:py-36 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <p className="sel-invert annotation mb-4">Work</p>
        <h2
          className="text-3xl sm:text-4xl font-bold leading-tight mb-6"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          War Stories
        </h2>
        <p
          className="sel-muted text-lg max-w-2xl mb-16 leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          Not a list of features. These are the problems I found, the systems I
          built to solve them, and what happened after.
        </p>

        <div className="space-y-20">
          {projects.map((p) => (
            <article key={p.num} className="reveal war-story rounded-xl border p-8 sm:p-10" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              {/* Header row */}
              <div className="flex items-start gap-6 mb-6">
                <span
                  className="shrink-0 font-mono text-5xl font-bold leading-none select-none"
                  style={{ color: "color-mix(in srgb, var(--accent) 20%, transparent)" }}
                >
                  {p.num}
                </span>
                <div className="flex-1">
                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="sel-invert font-mono text-2xl font-bold"
                      style={{ color: "var(--terracotta)" }}
                    >
                      {p.metric}
                    </span>
                    <span
                      className="sel-muted font-mono text-xs uppercase tracking-wider"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {p.metricLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* The "why" — personal motivation */}
              <blockquote
                className="sel-muted border-l-2 pl-5 mb-6 text-base italic leading-relaxed"
                style={{
                  borderColor: "var(--terracotta)",
                  color: "var(--fg-muted)",
                }}
              >
                {p.why}
              </blockquote>

              {/* Story */}
              <p
                className="sel-muted text-base leading-relaxed mb-4"
                style={{ color: "var(--fg-muted)" }}
              >
                {p.story}
              </p>

              {/* Aftermath */}
              <p className="text-base leading-relaxed mb-6">
                <span
                  className="sel-accent font-mono text-xs uppercase tracking-wider mr-2"
                  style={{ color: "var(--accent-bright)" }}
                >
                  Aftermath:
                </span>
                <span className="sel-muted" style={{ color: "var(--fg-muted)" }}>{p.aftermath}</span>
              </p>

              {/* NDA notice */}
              {p.nda && (
                <div
                  className="flex items-start gap-3 p-4 rounded-lg border mb-6"
                  style={{
                    borderColor: "color-mix(in srgb, var(--fg-muted) 15%, transparent)",
                    background: "color-mix(in srgb, var(--bg) 60%, var(--card-bg))",
                  }}
                >
                  <span className="sel-muted text-sm select-none" style={{ color: "var(--fg-muted)" }}>
                    🔒
                  </span>
                  <p className="sel-muted text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {p.nda}
                  </p>
                </div>
              )}

              {/* Video */}
              {p.video && (
                <div
                  className="rounded-lg overflow-hidden border mb-6"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <video autoPlay muted loop playsInline className="w-full">
                    <source src={p.video} type="video/mp4" />
                  </video>
                </div>
              )}

              {/* Tags + link */}
              <div className="flex flex-wrap items-center gap-3">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="sel-accent px-3 py-1 text-xs font-mono rounded border"
                    style={{
                      color: "var(--accent-bright)",
                      background: "color-mix(in srgb, var(--accent) 5%, transparent)",
                      borderColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    }}
                  >
                    {t}
                  </span>
                ))}
                {p.link && (
                  <a
                    href={p.link.href}
                    className="sel-accent ml-auto font-mono text-xs uppercase tracking-wider transition-colors hover:text-[var(--accent-bright)]"
                    style={{ color: "var(--accent)" }}
                  >
                    {p.link.label} →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
