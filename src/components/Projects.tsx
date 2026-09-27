import ScreenshotCarousel from "./ScreenshotCarousel";
import LazyVideo from "./LazyVideo";

const projects = [
  {
    sheet: "01",
    title: "The Offer Letter Engine",
    why: "I was watching a colleague spend an entire afternoon manually converting a Word document into JavaScript. Same structure every time, same rules, same mistakes. I thought: this should take seconds, not hours.",
    story:
      "Built a parsing engine in Node.js backed by PostgreSQL that takes a Word document containing contract details, extracts the content, applies strict validation rules, and generates production-ready JavaScript — handling complex edge cases across multiple countries and employment types. Code generation completes in roughly 10 seconds. The full end-to-end process takes under 10 minutes, down from 6 hours.",
    aftermath:
      "The company's CTO and Director of Engineering is planning the core logic for integration into the flagship self-service product.",
    tags: ["Node.js", "Django/DRF", "PostgreSQL", "Parsing Engine", "Validation"],
    metric: "97%+",
    metricLabel: "time saved",
    nda: "Due to confidentiality, only a demonstration of the tool's workflow is shown — illustrating how it converts document specs into production-ready code.",
    video: "/offer_letter_tool_demo.mp4",
    link: null,
  },
  {
    sheet: "02",
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
    sheet: "03",
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

const TOTAL = projects.length;

export default function Projects() {
  return (
    <section id="work" className="py-20 sm:py-32 px-6 sm:px-10">
      <div style={{ maxWidth: "1120px", marginInline: "auto" }}>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-0 mb-16" aria-hidden="false">
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span
            className="px-3 font-mono"
            style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
          >
            — 02 · work —
          </span>
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
        </div>

        <h2
          className="mb-4"
          style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: 500 }}
        >
          War Stories
        </h2>
        <p
          className="mb-16"
          style={{
            color: "var(--ink-soft)",
            maxWidth: "560px",
            lineHeight: 1.7,
            fontSize: "1rem",
          }}
        >
          Not a list of features. These are the problems I found, the systems I
          built to solve them, and what happened after.
        </p>

        <div className="space-y-0">
          {projects.map((p, idx) => (
            <article
              key={p.sheet}
              className="reveal border p-8 sm:p-10"
              style={{
                borderColor: "var(--line)",
                background: "var(--paper-raised)",
                marginBottom: idx < projects.length - 1 ? "1px" : 0,
              }}
            >
              {/* Header row: circled ref flag + leader + title + leader-line callout */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                <div className="flex-1">
                  {/* §8-C: Circled reference flag connecting to case-study title */}
                  <div className="flex items-center gap-0 mb-3">
                    <div className="bp-ref-flag">
                      <div className="bp-ref-flag__circle">
                        <span className="bp-ref-flag__num">{p.sheet}</span>
                      </div>
                      <span
                        className="bp-ref-flag__caption"
                        aria-label={`Sheet ${p.sheet} of ${TOTAL}`}
                      >
                        SHEET {p.sheet} OF {String(TOTAL).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Short leader from circle into heading */}
                    <div className="bp-ref-leader hidden sm:flex">
                      <div className="bp-ref-leader__line" />
                    </div>
                  </div>
                  <h3
                    className="font-mono"
                    style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)", fontWeight: 500, color: "var(--ink)" }}
                  >
                    {p.title}
                  </h3>
                </div>

                {/* Leader-line callout for the metric */}
                <div
                  className="flex items-center flex-shrink-0"
                  aria-label={`${p.metric} ${p.metricLabel}`}
                >
                  <span className="bp-leader-line" aria-hidden="true" />
                  <span className="bp-leader-dot" aria-hidden="true" />
                  <span className="bp-leader-value">{p.metric}</span>
                  <span className="bp-leader-label">{p.metricLabel}</span>
                </div>
              </div>

              {/* Motivation quote */}
              <blockquote
                className="border-l-2 pl-5 mb-6 text-base italic"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--ink-soft)",
                  lineHeight: 1.75,
                }}
              >
                {p.why}
              </blockquote>

              {/* Story */}
              <p
                className="text-base mb-4"
                style={{ color: "var(--ink-soft)", lineHeight: 1.75 }}
              >
                {p.story}
              </p>

              {/* Aftermath */}
              <p className="text-base mb-6" style={{ lineHeight: 1.75 }}>
                <span
                  className="font-mono mr-2"
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent-2)",
                  }}
                >
                  Aftermath:
                </span>
                <span style={{ color: "var(--ink-soft)" }}>{p.aftermath}</span>
              </p>

              {/* NDA notice */}
              {p.nda && (
                <div className="bp-nda mb-6">
                  <span style={{ flexShrink: 0 }} aria-hidden="true">🔒</span>
                  <p>{p.nda}</p>
                </div>
              )}

              {/* Video */}
              {p.video && (
                <div className="mb-6 border" style={{ borderColor: "var(--line)" }}>
                  <LazyVideo src={p.video} className="overflow-hidden" />
                </div>
              )}

              {/* BOM chips + link */}
              <div className="flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="bp-chip">{t}</span>
                ))}
                {p.link && (
                  <a
                    href={p.link.href}
                    className="ml-auto font-mono text-xs transition-colors"
                    style={{
                      color: "var(--accent)",
                      letterSpacing: "0.06em",
                      fontSize: "0.72rem",
                      textDecoration: "underline",
                      textDecorationColor: "var(--line)",
                      textUnderlineOffset: "3px",
                    }}
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
