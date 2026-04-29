const skills = [
  { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", hoverColor: "#E34F26" },
  { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg", hoverColor: "#1572B6" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", hoverColor: "#F7DF1E" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", hoverColor: "#3178C6" },
  { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", hoverColor: "#ED8B00" },
  { name: "C#", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg", hoverColor: "#68217A" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", hoverColor: "#3776AB" },
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", hoverColor: "#61DAFB" },
  { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", hoverColor: "#808080" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", hoverColor: "#339933" },
  { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg", hoverColor: "#336791" },
    { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg", hoverColor: "#777BB4" },
  { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg", hoverColor: "#CC2927" },
  { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg", hoverColor: "#FFCA28" },
  { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", hoverColor: "#4479A1" },
  { name: "TDD", icon: null, hoverColor: "#E5534B" },
  { name: "Clean Architecture", icon: null, hoverColor: "#6C63FF" },
  { name: "REST APIs", icon: null, hoverColor: "#009688" },
  { name: "CI/CD", icon: null, hoverColor: "#FC6D26" },
  { name: "AI-Native Dev", icon: null, hoverColor: "#10A37F" },
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
              I work across the full stack with TypeScript, Node.js, and React, with a strong focus on automation and internal tooling. I enjoy turning slow, repetitive processes into fast, reliable systems — and I bring that same precision to every feature I build.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
              Based in the Philippines, I collaborate remotely with teams across different timezones. I'm comfortable working async, communicating clearly, and keeping things moving without hand-holding.
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
                  className="skill-card hover-zoom flex items-center gap-3 px-4 py-3 rounded-lg border select-none transition-colors duration-200"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                    color: "var(--muted)",
                    ["--skill-hover-bg" as string]: `color-mix(in srgb, ${s.hoverColor} 12%, var(--card-bg))`,
                    ["--skill-hover-border" as string]: `color-mix(in srgb, ${s.hoverColor} 30%, var(--card-border))`,
                  }}
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
