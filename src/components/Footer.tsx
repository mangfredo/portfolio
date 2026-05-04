export default function Footer() {
  return (
    <footer className="border-t py-16 px-6 sm:px-10" style={{ borderColor: "var(--card-border)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Let&apos;s build something.
            </h2>
            <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--fg-muted)" }}>
              I&apos;m open to full-time roles, contract work, and interesting
              freelance projects. If you have a problem that needs solving,
              I&apos;d like to hear about it.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <a
              href="https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm transition-colors hover:text-[var(--accent-bright)]"
              style={{ color: "var(--accent)" }}
            >
              LinkedIn ↗
            </a>
            <span className="font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
              09919036289
            </span>
          </div>
        </div>

        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "var(--card-border)" }}
        >
          <p className="font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            &copy; {new Date().getFullYear()} Tristan Sereño
          </p>
          <p className="font-mono text-xs" style={{ color: "color-mix(in srgb, var(--fg-muted) 50%, transparent)" }}>
            Next.js · Tailwind · Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
