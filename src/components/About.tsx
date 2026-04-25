const skills = [
  "HTML", "CSS", "JavaScript", "TypeScript", "Java", "C#", "Python",
  "React", "Next.js", "Node.js", "PostgreSQL", "AI-Native Dev",
  "TDD", "Clean Architecture", "REST APIs", "CI/CD",
];

export default function About() {
  return (
    <section id="about" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent)" }}>About</p>
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-8">
              Engineer who ships <span className="sel-invert" style={{ color: "var(--accent)" }}>real impact</span>
            </h2>
            <p className="text-lg leading-relaxed mb-5" style={{ color: "var(--muted)" }}>
             I specialize in AI-native development and full-stack TypeScript, architecting systems that transform operational friction into competitive advantages. My work sits at the intersection of product engineering and high-scale automation—designing deterministic tools that are not just fast, but foundational to business growth.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Based in the Philippines, I work remotely with global teams across
              multiple timezones, bringing a disciplined, async-first approach to
              every engagement.
            </p>
          </div>
          <div>
            <h3 className="sel-invert text-sm font-mono mb-5 uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Core Stack
            </h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 text-sm font-mono rounded-md border"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
