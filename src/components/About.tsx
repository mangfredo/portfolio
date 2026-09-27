const stack = [
  {
    category: "Languages & Runtimes",
    items: ["TypeScript", "JavaScript", "Python", "C#", "PHP", "Node.js"],
  },
  {
    category: "View Layers & Design",
    items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS", "React Native"],
  },
  {
    category: "Backend & Data",
    items: ["Express", "Django", "REST APIs", "PostgreSQL", "MS SQL", "MySQL", "MongoDB", "Firebase"],
  },
  {
    category: "Infrastructure & Tooling",
    items: ["Docker", "Kubernetes", "Git", "CI/CD", "VS Code Extensions", "Jira"],
  },
  {
    category: "Approach",
    items: ["AI-Native Development", "Automation-First", "Clean Architecture", "TDD", "Async Remote"],
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-32 px-6 sm:px-10">
      <div style={{ maxWidth: "1120px", marginInline: "auto" }}>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 md:gap-24">

          {/* ── Left: narrative ───────────────────────────────────── */}
          <div>
            <p className="annotation mb-4">About</p>
            <h2
              className="mb-8 leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: 500 }}
            >
              Engineer who ships real impact
            </h2>

            <div className="space-y-5" style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              <p>
                I work across the full stack with TypeScript, Node.js, and React — but my real
                focus is automation and internal tooling. I like finding the slow, repetitive
                process that everyone just accepts, and replacing it with something that runs in
                seconds.
              </p>
              <p>
                Based in the Philippines, working remotely with teams across timezones. I&apos;m
                comfortable async, I communicate clearly, and I don&apos;t need hand-holding to
                get things done.
              </p>
              <p>
                I care about the craft. Clean code, semantic HTML, accessible interfaces, fast
                load times. Not because a checklist says so, but because that&apos;s what
                separates software that works from software that <em>lasts</em>.
              </p>
            </div>
          </div>

          {/* ── Right: Legend component ───────────────────────────── */}
          <div>
            <p className="annotation mb-4">Core Stack</p>

            {/* Legend — map/drawing legend style */}
            <div className="bp-legend">
              {stack.map((group) => (
                <div key={group.category} className="bp-legend-group">
                  <p className="bp-legend-heading">{group.category}</p>
                  <div className="bp-legend-items">
                    {group.items.map((item) => (
                      <span key={item} className="bp-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
