import ScreenshotCarousel from "./ScreenshotCarousel";

const projects = [
  {
    title: "Numerra",
    platform: "Microsoft Store",
    story:
      "I wanted a calculator that didn't make me switch between five different apps. Standard, Scientific, Programmer, RPN — all in one place. Added measurement and currency converters supporting 180+ currencies with real-time rates — you can type full expressions directly in the converter, it parses and evaluates the input, then converts the result. Includes financial tools, a scientific constants library, and formula references. Programmer mode supports HEX, DEC, OCT, BIN with full bitwise operations.",
    tags: ["WinUI 3", "C#", "Windows App SDK", "Published"],
    link: "https://apps.microsoft.com/detail/9npwb2bk246z",
    screenshots: [
      "/numerra_1.png",
      "/numerra_2.png",
      "/numerra_3.png",
      "/numerra_4.png",
      "/numerra_5.png",
    ],
  },
  {
    title: "YWCIMS",
    platform: "Web Platform",
    story:
      "Built the admin and employer-facing sides of an internal management system for YWCI Manpower Services — covering workforce onboarding, attendance tracking, payroll processing, compliance management, and government benefit reporting.",
    tags: ["Web App", "Admin Panel", "Workforce Management"],
    link: "https://ywcims.com/home.html",
  },
  {
    title: "Zamora Gym Ecosystem",
    platform: "Mobile — iOS/Android",
    story:
      "A private client needed to replace their paper-based membership system. Built a dual-purpose platform: management dashboard for the owner (membership tracking, revenue), and a training companion for members (custom interval timer, video tutorials, daily checklist). Replaced the entire manual workflow.",
    tags: ["React Native", "Mobile", "Dashboard", "Fitness"],
    link: "https://github.com/mangfredo/Zamora-Gym-App",
  },
  {
    title: "JOBSearch",
    platform: "Web Platform",
    story:
      "A recruitment portal built for a client's capstone presentation. Focused on minimizing time-to-apply with an intuitive interface that bridges talent and opportunity.",
    tags: ["Web App", "UI/UX", "Recruitment"],
    link: "https://github.com/mangfredo/JOBSearch",
  },
  {
    title: "Fix Me: The IT Odyssey",
    platform: "Interactive Simulation",
    story:
      "A narrative-driven simulation where you play as an IT Specialist navigating a corporate headquarters. Diagnose hardware failures, resolve security vulnerabilities, and fix technical bottlenecks under time pressure. A tribute to the unsung heroes of tech support.",
    tags: ["Simulation", "Gamification", "Capstone"],
    link: "https://github.com/mangfredo/Fix-Me-Game",
  },
  {
    title: "TaskManagementApp",
    platform: "Desktop — Windows",
    story:
      "A lightweight, offline-capable task management system built to a client's requirements. Optimized for speed and native Windows integration — no external latency, no cloud dependency.",
    tags: ["Windows Forms", "C#", "Desktop"],
    link: "https://github.com/mangfredo/Task-Management-App",
  },
  {
    title: "Exotech",
    platform: "Specialized POS",
    story:
      "Standard POS systems aren't built for exotic food markets. Exotech handles high-value, rare-stock items with specialized inventory and pricing models that generic retail software can't touch.",
    tags: ["POS", "Windows Forms", "C#"],
    link: "https://github.com/mangfredo/Exotech",
  },
];

export default function PersonalProjects() {
  return (
    <section id="projects" className="relative py-20 sm:py-36 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <p className="sel-invert annotation mb-4">Projects</p>
        <h2
          className="text-3xl sm:text-4xl font-bold leading-tight mb-6"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Client &amp; Personal Work
        </h2>
        <p
          className="text-lg max-w-2xl mb-16 leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          Freelance builds, published apps, and side projects — each one
          started because something needed to exist and didn&apos;t.
        </p>

        {/* Asymmetric grid — not uniform cards */}
        <div className="grid md:grid-cols-2 gap-6 reveal-stagger">
          {projects.map((p, i) => {
            // First project spans full width
            const isWide = i === 0;

            return (
              <article
                key={p.title}
                className={`reveal war-story rounded-xl border p-7 sm:p-8 flex flex-col ${
                  isWide ? "md:col-span-2" : ""
                }`}
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <span
                    className="font-mono text-[0.65rem] px-2 py-0.5 rounded border uppercase tracking-wider"
                    style={{
                      color: "var(--accent-bright)",
                      borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
                      background: "color-mix(in srgb, var(--accent) 5%, transparent)",
                    }}
                  >
                    {p.platform}
                  </span>
                </div>

                <p
                  className="text-sm leading-relaxed mb-4 flex-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {p.story}
                </p>

                {"screenshots" in p && p.screenshots && (
                  <ScreenshotCarousel
                    screenshots={p.screenshots}
                    title={p.title}
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 mt-auto pt-4">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-xs font-mono rounded border"
                      style={{
                        color: "var(--fg-muted)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto font-mono text-xs transition-colors hover:text-[var(--accent-bright)]"
                      style={{ color: "var(--accent)" }}
                    >
                      {p.link.includes("github.com")
                        ? "GitHub ↗"
                        : p.link.includes("apps.microsoft.com")
                        ? "Store ↗"
                        : "Visit ↗"}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
