const stack = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "C#", "Python", "Java", "PHP", "Ruby"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS"] },
  { category: "Backend", items: ["Node.js", "REST APIs", "PostgreSQL", "MySQL", "Firebase"] },
  { category: "Tooling", items: ["Git", "Docker", "Kubernetes", "VS Code Extensions", "CI/CD", "TDD", "Clean Architecture"] },
  { category: "Approach", items: ["AI-Native Development", "Automation-First", "Async Remote"] },
];

export default function About() {
  return (
    <section id="about" className="relative py-20 sm:py-36 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 md:gap-24">
          {/* Left — narrative */}
          <div>
            <p className="sel-invert annotation mb-4">About</p>
            <h2
              className="text-3xl sm:text-4xl font-bold leading-tight mb-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Engineer who ships
              <br />
              <em className="sel-invert not-italic" style={{ color: "var(--terracotta)" }}>
                real impact
              </em>
            </h2>

            <div className="sel-muted space-y-5 text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              <p>
                I work across the full stack with TypeScript, Node.js, and React — but my real focus is automation and internal tooling. I like finding the slow, repetitive process that everyone just accepts, and replacing it with something that runs in seconds.
              </p>
              <p>
                Based in the Philippines, working remotely with teams across timezones. I'm comfortable async, I communicate clearly, and I don't need hand-holding to get things done.
              </p>
              <p>
                I care about the craft. Clean code, semantic HTML, accessible interfaces, fast load times. Not because a checklist says so, but because that's what separates software that works from software that <em>lasts</em>.
              </p>
            </div>
          </div>

          {/* Right — stack, not a bento grid */}
          <div>
            <p className="annotation mb-6">Core Stack</p>
            <div className="space-y-6 reveal-stagger">
              {stack.map((group) => (
                <div key={group.category} className="reveal">
                  <h3
                    className="sel-accent font-mono text-xs uppercase tracking-[0.15em] mb-3"
                    style={{ color: "var(--accent-bright)" }}
                  >
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="sel-muted px-3 py-1.5 text-sm font-mono rounded border transition-colors hover:border-[var(--accent)]"
                        style={{
                          background: "var(--card-bg)",
                          borderColor: "var(--card-border)",
                          color: "var(--fg-muted)",
                        }}
                      >
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
