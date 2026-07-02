const experience = [
  {
    company: "Rival HR",
    type: "US-based HR Tech Company",
    role: "Technical Solutions Engineer",
    period: "Aug 2025 – Present",
    location: "Remote",
    description:
      "Develop and maintain production systems across frontend and backend environments. Build dynamic form logic, automation scripts, and internal tooling to improve operational efficiency.",
    highlights: [
      "Engineered a Node.js automation tool that converts Word specifications into executable JavaScript — reducing development time from 6 hours to 10 minutes",
      "Developed 11+ internal automation tools integrated into Jira-based workflows",
      "Built a VS Code extension to automate formatting and improve output consistency",
      "Implemented a CSS-based print rendering solution adopted as a team-wide standard",
    ],
    tags: ["Node.js", "React", "PostgreSQL", "Jira", "VS Code Extensions"],
  },
  {
    company: "YWCI Manpower Services",
    type: "Workforce Management",
    role: "Website Developer Intern",
    period: "Jan 2025 – May 2025",
    location: "On-site",
    description:
      "Developed an admin dashboard with full CRUD functionality. Built dynamic forms and interfaces for managing content and user data with responsive UI for non-technical users.",
    highlights: [
      "Built a multi-tenant recruitment and payroll platform using Node.js and PostgreSQL",
      "Designed scalable database schemas for high-volume operational data",
      "Automated payroll processes, reducing manual effort and improving reliability",
    ],
    tags: ["HTML/CSS", "JavaScript", "CRUD", "Admin Dashboard"],
  },
  {
    company: "Freelance / Contract",
    type: "Independent",
    role: "Full-Stack Developer",
    period: "2021 – Present",
    location: "Remote",
    description:
      "Designed and delivered full-stack systems, internal platforms, and workflow automation solutions for multiple clients across different industries.",
    highlights: [
      "Architected ERP system (YWCIMS) — multi-tenant recruitment and payroll platform",
      "Developed cross-platform React Native app with real-time data sync for gym management",
      "Built automation pipelines and internal tools to streamline repetitive business processes",
      "Delivered features across time zones with US-based and Australian clients",
    ],
    tags: ["TypeScript", "JavaScript", "React", "React Native", "Next.js", "Node.js", "Django", "Express", "PostgreSQL", "MS SQL", "Docker", "Tailwind CSS", "REST APIs", "C#", "Python", "PHP"],
  },
];

const education = {
  degree: "Bachelor of Science in Information Technology",
  school: "STI College Caloocan",
  period: "2021 – 2025",
  certifications: [
    "Java Foundation — Course Completion, 2022",
    "Linux Professional Institute — Course Completion, 2022",
  ],
};

export default function Experience() {
  return (
    <section id="experience" className="relative py-20 sm:py-36 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <p className="sel-invert annotation mb-4">Experience</p>
        <h2
          className="text-3xl sm:text-4xl font-bold leading-tight mb-16"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Where I&apos;ve worked
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px hidden sm:block"
            style={{ background: "var(--card-border)" }}
            aria-hidden="true"
          />

          <div className="space-y-12 reveal-stagger">
            {experience.map((job, i) => (
              <div key={i} className="reveal relative sm:pl-10">
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-[10px] w-[15px] h-[15px] rounded-full border-2 hidden sm:block"
                  style={{
                    borderColor: "var(--accent)",
                    background: "var(--bg)",
                  }}
                  aria-hidden="true"
                />

                {/* Card */}
                <div
                  className="rounded-xl border p-6 sm:p-8 transition-colors hover:border-[var(--accent)]"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{job.company}</h3>
                      <p
                        className="sel-invert font-medium text-base"
                        style={{ color: "var(--terracotta)" }}
                      >
                        {job.role}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <span
                        className="sel-accent font-mono text-xs uppercase tracking-wider"
                        style={{ color: "var(--accent-bright)" }}
                      >
                        {job.period}
                      </span>
                      <span
                        className="sel-muted font-mono text-xs"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {job.location} · {job.type}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="sel-muted text-sm leading-relaxed mb-4"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {job.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-5">
                    {job.highlights.map((h, j) => (
                      <li
                        key={j}
                        className="sel-muted flex gap-2 text-sm leading-relaxed"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        <span
                          className="sel-accent shrink-0 mt-0.5"
                          style={{ color: "var(--accent-bright)" }}
                        >
                          ▹
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="sel-muted px-2.5 py-1 text-xs font-mono rounded border"
                        style={{
                          color: "var(--fg-muted)",
                          borderColor: "var(--card-border)",
                          background: "color-mix(in srgb, var(--accent) 3%, transparent)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-20">
          <div className="hr-char font-mono text-xs tracking-wider">EDUCATION</div>
          <div
            className="mt-6 rounded-xl border p-6 sm:p-8 reveal"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold">{education.degree}</h3>
                <p className="sel-muted text-sm" style={{ color: "var(--fg-muted)" }}>
                  {education.school}
                </p>
              </div>
              <span
                className="sel-accent font-mono text-xs uppercase tracking-wider"
                style={{ color: "var(--accent-bright)" }}
              >
                {education.period}
              </span>
            </div>

            {/* Certifications */}
            <div className="mt-4">
              <p
                className="sel-accent font-mono text-xs uppercase tracking-wider mb-3"
                style={{ color: "var(--accent-bright)" }}
              >
                Certifications
              </p>
              <div className="space-y-1.5">
                {education.certifications.map((cert) => (
                  <p
                    key={cert}
                    className="sel-muted flex gap-2 text-sm"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>✓</span> {cert}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
