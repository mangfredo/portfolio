import ScreenshotCarousel from "./ScreenshotCarousel";

const projects = [
  {
    title: "Numerra",
    kind: "Published App",
    platform: "Microsoft Store",
    story:
      "I wanted a calculator that didn't make me switch between five different apps. Standard, Scientific, Programmer, RPN — all in one place. Added measurement and currency converters supporting 180+ currencies with real-time rates — you can type full expressions directly in the converter, it parses and evaluates the input, then converts the result. Includes financial tools, a scientific constants library, and formula references. Programmer mode supports HEX, DEC, OCT, BIN with full bitwise operations.",
    tags: ["WinUI 3", "C#", "Windows App SDK", "Published"],
    link: "https://apps.microsoft.com/detail/9npwb2bk246z",
    screenshots: [
      "/numerra_1.webp",
      "/numerra_2.webp",
      "/numerra_3.webp",
      "/numerra_4.webp",
      "/numerra_5.webp",
    ],
    featured: true,
  },
  {
    title: "YWCIMS",
    kind: "Web Platform",
    platform: "Web Platform",
    story:
      "Built the admin and employer-facing sides of an internal management system for YWCI Manpower Services — covering workforce onboarding, attendance tracking, payroll processing, compliance management, and government benefit reporting.",
    tags: ["Web App", "Admin Panel", "Workforce Management"],
    link: "https://ywcims.com/home.html",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "Zamora Gym Ecosystem",
    kind: "Mobile App",
    platform: "Mobile — iOS/Android",
    story:
      "A private client needed to replace their paper-based membership system. Built a dual-purpose platform: management dashboard for the owner (membership tracking, revenue), and a training companion for members (custom interval timer, video tutorials, daily checklist). Replaced the entire manual workflow.",
    tags: ["React Native", "Mobile", "Dashboard", "Fitness"],
    link: "https://github.com/mangfredo/Zamora-Gym-App",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "JOBSearch",
    kind: "Web Platform",
    platform: "Web Platform",
    story:
      "A recruitment portal built for a client's capstone presentation. Focused on minimizing time-to-apply with an intuitive interface that bridges talent and opportunity.",
    tags: ["Web App", "UI/UX", "Recruitment"],
    link: "https://github.com/mangfredo/JOBSearch",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "Fix Me: The IT Odyssey",
    kind: "Simulation",
    platform: "Interactive Simulation",
    story:
      "A narrative-driven simulation where you play as an IT Specialist navigating a corporate headquarters. Diagnose hardware failures, resolve security vulnerabilities, and fix technical bottlenecks under time pressure. A tribute to the unsung heroes of tech support.",
    tags: ["Simulation", "Gamification", "Capstone"],
    link: "https://github.com/mangfredo/Fix-Me-Game",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "Budget Tracker",
    kind: "Personal Tool",
    platform: "Personal Tool",
    story:
      "A private budget tracker I built for personal use. Organizes expenses by pay period or month, tracks a running total against a set budget, and shows the remaining balance at a glance. Everything lives in localStorage — no backend, no account, no fuss. Accessible only by direct URL.",
    tags: ["Next.js", "TypeScript", "localStorage", "Mobile-first"],
    link: "/budget-tracker",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "TaskManagementApp",
    kind: "Desktop App",
    platform: "Desktop — Windows",
    story:
      "A lightweight, offline-capable task management system built to a client's requirements. Optimized for speed and native Windows integration — no external latency, no cloud dependency.",
    tags: ["Windows Forms", "C#", "Desktop"],
    link: "https://github.com/mangfredo/Task-Management-App",
    screenshots: undefined,
    featured: false,
  },
  {
    title: "Exotech",
    kind: "Specialized POS",
    platform: "Specialized POS",
    story:
      "Standard POS systems aren't built for exotic food markets. Exotech handles high-value, rare-stock items with specialized inventory and pricing models that generic retail software can't touch.",
    tags: ["POS", "Windows Forms", "C#"],
    link: "https://github.com/mangfredo/Exotech",
    screenshots: undefined,
    featured: false,
  },
];

export default function PersonalProjects() {
  return (
    <section id="projects" className="py-20 sm:py-32 px-6 sm:px-10">
      <div style={{ maxWidth: "1120px", marginInline: "auto" }}>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-0 mb-16" aria-hidden="false">
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span
            className="px-3 font-mono"
            style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
          >
            — 03 · projects —
          </span>
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
        </div>

        <h2
          className="mb-4"
          style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: 500 }}
        >
          Client &amp; Personal Work
        </h2>
        <p
          className="mb-16"
          style={{ color: "var(--ink-soft)", maxWidth: "560px", lineHeight: 1.7, fontSize: "1rem" }}
        >
          Freelance builds, published apps, and side projects — each one
          started because something needed to exist and didn&apos;t.
        </p>

        {/* ── Project grid ── */}
        <div className="grid md:grid-cols-2 gap-0 reveal-stagger">
          {projects.map((p, i) => {
            const isFeatured = p.featured;
            const figCount = p.screenshots?.length ?? 0;

            return (
              <article
                key={p.title}
                className={`reveal border flex flex-col ${isFeatured ? "md:col-span-2" : ""}`}
                style={{
                  borderColor: "var(--line)",
                  background: "var(--paper-raised)",
                  /* Collapse adjacent borders */
                  marginTop: i === 0 ? 0 : "-1px",
                  marginLeft: !isFeatured && i % 2 !== 0 ? "-1px" : 0,
                }}
              >
                {/* Card header: title + micro title-block kind label */}
                <div
                  className="flex items-start justify-between gap-3 p-6 sm:p-7 border-b"
                  style={{ borderColor: "var(--line)" }}
                >
                  <h3
                    className="font-mono"
                    style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ink)" }}
                  >
                    {p.title}
                  </h3>
                  {/* Micro title-block label — top-right corner, like a drawing's title block */}
                  <span className="bp-micro-label flex-shrink-0">{p.kind}</span>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <p
                    className="text-sm mb-5 flex-1"
                    style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}
                  >
                    {p.story}
                  </p>

                  {/* Screenshots with Fig. captions */}
                  {p.screenshots && p.screenshots.length > 0 && (
                    <div className="mb-5">
                      <ScreenshotCarousel
                        screenshots={p.screenshots}
                        title={p.title}
                      />
                      {/* Figure captions */}
                      <div
                        className="grid mt-0"
                        style={{ gridTemplateColumns: `repeat(${Math.min(figCount, 5)}, 1fr)`, gap: "0" }}
                        aria-hidden="true"
                      >
                        {p.screenshots.map((_, fi) => (
                          <p
                            key={fi}
                            className="bp-fig-caption"
                            style={{ fontSize: "0.6rem" }}
                          >
                            Fig. {fi + 1}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOM chips + link */}
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t" style={{ borderColor: "var(--line)" }}>
                    {p.tags.map((t) => (
                      <span key={t} className="bp-chip">{t}</span>
                    ))}
                    {p.link && (
                      <a
                        href={p.link}
                        target={p.link.startsWith("/") ? "_self" : "_blank"}
                        rel={p.link.startsWith("/") ? undefined : "noopener noreferrer"}
                        className="ml-auto font-mono text-xs transition-colors"
                        style={{
                          color: "var(--accent)",
                          fontSize: "0.72rem",
                          textDecoration: "underline",
                          textDecorationColor: "var(--line)",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {p.link.startsWith("/")
                          ? "Open ↗"
                          : p.link.includes("github.com")
                          ? "GitHub ↗"
                          : p.link.includes("apps.microsoft.com")
                          ? "Store ↗"
                          : "Visit ↗"}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
