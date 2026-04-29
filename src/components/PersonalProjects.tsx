const projects = [
  {
    title: "YWCIMS",
    platform: "Web Platform",
    mission:
      "An internal management system for YWCI Manpower Services — handling recruitment, workforce management, and operational support.",
    story:
      "Built the admin and employer-facing sides of the platform, covering workforce onboarding, attendance tracking, payroll processing, compliance management, and government benefit reporting. The system supports end-to-end manpower operations for the company's clients.",
    impact: null,
    tags: ["Web App", "Admin Panel", "Workforce Management", "Client Work"],
    link: "https://ywcims.com/home.html",
  },
  {
    title: "Zamora Gym Ecosystem",
    platform: "Mobile — iOS/Android",
    mission:
      "A dual-purpose fitness management platform bridging gym operations and athlete performance.",
    story:
      "Developed for a private client to modernize a manual membership system. For the owner, it's a high-integrity management dashboard for membership tracking and revenue stability. For the user, it's a high-performance training partner featuring a custom-built interval timer, curated video tutorials, and a persistent daily checklist for athlete accountability.",
    impact:
      "Replaced a paper-based tracking system with a unified digital experience, increasing member retention and operational transparency.",
    tags: ["React Native", "Mobile", "Dashboard", "Fitness"],
    link: "https://github.com/mangfredo/Zamora-Gym-App",
  },
  {
    title: "JOBSearch",
    platform: "Web Platform",
    mission: "A high-speed recruitment portal built for a client's capstone presentation.",
    story:
      "A web application developed for a client to streamline the job-matching process and presented as their capstone project. The focus was on building an intuitive user interface that minimizes time-to-apply, ensuring a seamless bridge between talent and opportunity.",
    impact: null,
    tags: ["Web App", "UI/UX", "Recruitment", "Client Work"],
    link: "https://github.com/mangfredo/JOBSearch",
  },
  {
    title: "Fix Me: The IT Odyssey",
    platform: "Interactive Capstone",
    mission:
      "A narrative-driven simulation designed to gamify the complexities of Enterprise IT Support.",
    story:
      "This project follows the journey of an IT Specialist navigating the high-pressure environment of a corporate headquarters. The player must diagnose and resolve real-world technical bottlenecks, hardware failures, and security vulnerabilities under strict time constraints — a tribute to the unsung heroes of tech.",
    impact: null,
    tags: ["Simulation", "Gamification", "IT Support", "Capstone"],
    link: "https://github.com/mangfredo/Fix-Me-Game",
  },
  {
    title: "TaskManagementApp",
    platform: "Enterprise Windows Forms",
    mission: "A specialized desktop solution for complex internal task tracking.",
    story:
      "Built to a client's requirements for a lightweight, secure, and offline-capable task management system. Optimized for speed and native Windows integration, allowing the client to manage sensitive workflows with zero external latency.",
    impact: null,
    tags: ["Windows Forms", "C#", "Desktop", "Offline"],
    link: "https://github.com/mangfredo/Task-Management-App",
  },
  {
    title: "Exotech",
    platform: "Specialized POS System",
    mission:
      "A niche Point-of-Sale system architected for the exotic food industry.",
    story:
      "Born from the realization that standard retail POS systems aren't designed for the unique inventory and pricing models of exotic food markets. Exotech offers a specialized Windows Forms interface that manages high-value, rare-stock items with the precision of an enterprise retail engine.",
    impact: null,
    tags: ["POS", "Windows Forms", "C#", "Inventory"],
    link: "https://github.com/mangfredo/Exotech",
  },
];

export default function PersonalProjects() {
  return (
    <section id="personal" className="py-28 px-8">
      <div className="max-w-6xl mx-auto">
        <p
          className="sel-invert font-mono text-sm uppercase tracking-[0.2em] mb-3"
          style={{ color: "var(--accent)" }}
        >
          Client &amp; Personal Projects
        </p>
        <h2 className="text-4xl font-bold mb-14">
          Full-Stack Development
        </h2>

        <div className="grid gap-8">
          {projects.map((p) => (
            <article
              key={p.title}
              className="fade-in-up rounded-xl p-10 border transition-colors"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-semibold">{p.title}</h3>
                <span
                  className="sel-invert text-xs font-mono px-2.5 py-1 rounded border"
                  style={{
                    color: "var(--accent)",
                    borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
                    background: "color-mix(in srgb, var(--accent) 5%, transparent)",
                  }}
                >
                  {p.platform}
                </span>
              </div>

              <p
                className="sel-invert text-base font-medium mb-3"
                style={{ color: "var(--accent)" }}
              >
                {p.mission}
              </p>

              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "var(--muted)" }}
              >
                {p.story}
              </p>

              {p.impact && (
                <p className="text-base leading-relaxed mb-4">
                  <span
                    className="font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Impact:
                  </span>{" "}
                  <span style={{ color: "var(--muted)" }}>{p.impact}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="sel-invert px-3 py-1.5 text-sm font-mono rounded border"
                    style={{
                      color: "var(--accent)",
                      background:
                        "color-mix(in srgb, var(--accent) 5%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--accent) 10%, transparent)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {"link" in p && p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sel-invert inline-flex items-center gap-1.5 mt-4 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  {p.link.includes("github.com") ? "GitHub →" : "Visit Site →"}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
