import DimDate from "./DimDate";

const experience = [
  {
    company: "Rival HR",
    type: "US-based HR Tech Company",
    role: "Technical Solutions Engineer",
    period: "Aug 2025 – Present",
    location: "Remote",
    current: true,
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
    current: false,
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
    current: false,
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

/* ── Dimension-line section divider ── */
function SheetDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-0 my-12" aria-hidden="true">
      <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
      <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
      <span
        className="px-3 font-mono"
        style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
      >
        {label}
      </span>
      <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
      <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-32 px-6 sm:px-10">
      <div style={{ maxWidth: "1120px", marginInline: "auto" }}>

        {/* ── Section header as dimension-line divider ── */}
        <div className="flex items-center gap-0 mb-16" aria-hidden="false">
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span
            className="px-3 font-mono"
            style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
          >
            — 01 · experience —
          </span>
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
        </div>

        <h2
          className="mb-12"
          style={{ fontSize: "clamp(1.5rem, 3vw, 1.75rem)", fontWeight: 500 }}
        >
          Where I&apos;ve worked
        </h2>

        {/* ── Vertical rail ───────────────────────────────────────── */}
        <div className="relative reveal-stagger">
          {/* Rail line */}
          <div
            className="absolute hidden sm:block"
            style={{
              left: 0,
              top: "10px",
              bottom: "10px",
              width: "1px",
              background: "var(--line)",
            }}
            aria-hidden="true"
          />

          <div className="space-y-0">
            {experience.map((job, i) => (
              <div key={i} className="reveal relative sm:pl-10">
                {/* Rail node */}
                <div
                  className="absolute hidden sm:block"
                  style={{
                    left: "-5px",
                    top: "10px",
                    width: "11px",
                    height: "11px",
                    border: `1.5px solid var(--accent)`,
                    background: job.current ? "var(--accent)" : "var(--paper)",
                  }}
                  aria-hidden="true"
                />

                {/* Role panel */}
                <div
                  className="border p-6 sm:p-8 mb-0"
                  style={{
                    borderColor: "var(--line)",
                    background: "var(--paper-raised)",
                    marginBottom: i < experience.length - 1 ? "1px" : 0,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3
                        className="font-mono mb-1"
                        style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--ink)" }}
                      >
                        {job.company}
                      </h3>
                      <p style={{ color: "var(--accent)", fontSize: "0.9rem" }}>
                        {job.role}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <DimDate label={job.period} />
                      <span
                        className="font-mono"
                        style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}
                      >
                        {job.location} · {job.type}
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}
                  >
                    {job.description}
                  </p>

                  <ul className="space-y-2 mb-5">
                    {job.highlights.map((h, j) => (
                      <li
                        key={j}
                        className="flex gap-2 text-sm"
                        style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}
                      >
                        <span
                          style={{ color: "var(--accent-2)", flexShrink: 0, marginTop: "2px" }}
                          aria-hidden="true"
                        >
                          ▹
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* BOM chips */}
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span key={t} className="bp-chip">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Dimension-line divider between roles */}
                {i < experience.length - 1 && (
                  <div
                    className="flex items-center"
                    style={{ height: "32px" }}
                    aria-hidden="true"
                  >
                    <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Education ─────────────────────────────────────────────── */}
        <SheetDivider label="Education" />

        <div
          className="border p-6 sm:p-8 reveal"
          style={{ borderColor: "var(--line)", background: "var(--paper-raised)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
            <div>
              <h3
                className="font-mono mb-1"
                style={{ fontSize: "1rem", fontWeight: 500, color: "var(--ink)" }}
              >
                {education.degree}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--ink-soft)" }}>
                {education.school}
              </p>
            </div>
            <DimDate label={education.period} />
          </div>

          <p
            className="font-mono mb-3"
            style={{ fontSize: "0.68rem", letterSpacing: "0.1em", color: "var(--ink-soft)", textTransform: "uppercase" }}
          >
            Certifications
          </p>
          <div className="space-y-1.5">
            {education.certifications.map((cert) => (
              <p
                key={cert}
                className="flex gap-2 text-sm"
                style={{ color: "var(--ink-soft)" }}
              >
                <span style={{ color: "var(--accent-2)" }} aria-hidden="true">✓</span>
                {cert}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
