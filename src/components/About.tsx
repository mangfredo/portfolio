const skills = [
  { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "C#", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "TDD", icon: null },
  { name: "Clean Architecture", icon: null },
  { name: "REST APIs", icon: null },
  { name: "CI/CD", icon: null },
  { name: "AI-Native Dev", icon: null },
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
              I specialize in AI-native development and full-stack TypeScript, building systems that transform operational friction into competitive advantages. My work sits at the intersection of product engineering and automation — designing tools that are precise, maintainable, and fast.
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skills.map((s) => (
                <div
                  key={s.name}
                  className="hover-zoom flex items-center gap-3 px-4 py-3 rounded-lg border"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  {s.icon ? (
                    <img src={s.icon} alt={s.name} className="w-6 h-6 select-none" draggable="false" />
                  ) : (
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded" style={{ background: "var(--accent)", color: "white" }}>
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <span className="text-sm font-mono">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
