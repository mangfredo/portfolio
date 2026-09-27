export default function Footer() {
  const year = new Date().getFullYear();

  return (
    /*
     * Footer mirrors the header title block:
     * same bp-title-block strip, this time holding contact + copyright.
     * Sits at the bottom of the sheet — bookending the page.
     */
    <footer aria-label="Footer">
      {/* ── Closing section divider ── */}
      <div className="flex items-center gap-0 px-6 sm:px-10" aria-hidden="true">
        <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
        <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        <span
          className="px-3 font-mono"
          style={{ fontSize: "0.72rem", color: "var(--ink-soft)", letterSpacing: "0.06em", flexShrink: 0 }}
        >
          — end of sheet —
        </span>
        <span style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        <span style={{ width: "1px", height: "8px", background: "var(--line)", flexShrink: 0 }} />
      </div>

      {/* ── CTA block ── */}
      <div className="py-16 px-6 sm:px-10 border-b" style={{ borderColor: "var(--line)" }}>
        <div style={{ maxWidth: "1120px", marginInline: "auto" }}>
          <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <h2
                className="mb-4"
                style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)", fontWeight: 500, color: "var(--ink)" }}
              >
                Let&apos;s build something.
              </h2>
              <p style={{ color: "var(--ink-soft)", maxWidth: "400px", lineHeight: 1.7, fontSize: "1rem" }}>
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
                className="font-mono text-sm transition-colors"
                style={{
                  color: "var(--accent)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--line)",
                  textUnderlineOffset: "3px",
                  fontSize: "0.8rem",
                }}
              >
                LinkedIn ↗
              </a>
              <a
                href="mailto:tristansereno@gmail.com"
                className="font-mono text-sm transition-colors"
                style={{
                  color: "var(--ink-soft)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--line)",
                  textUnderlineOffset: "3px",
                  fontSize: "0.8rem",
                }}
              >
                tristansereno@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer title block — mirrors the header strip ── */}
      <div
        className="bp-title-block"
        style={{ position: "static", height: "auto", minHeight: "52px", flexWrap: "wrap" }}
        aria-label="Page footer"
      >
        {/* DRAWN field */}
        <span className="bp-title-field hidden lg:flex flex-col gap-0" style={{ padding: "0 1rem" }}>
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>DRAWN</span>
          <span style={{ fontSize: "0.72rem", color: "var(--ink)", fontWeight: 500 }}>Tristan Sereño</span>
        </span>

        {/* Name / closing */}
        <span className="bp-title-field" style={{ color: "var(--ink)", fontWeight: 500 }}>
          T.Sereño
        </span>

        {/* Contact field */}
        <a
          href="mailto:tristansereno@gmail.com"
          className="bp-title-field transition-colors"
          style={{ color: "var(--ink-soft)" }}
          aria-label="Email Tristan Sereño"
        >
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", display: "block", textTransform: "uppercase", marginBottom: "1px" }}>CONTACT</span>
          <span>tristansereno@gmail.com</span>
        </a>

        {/* Spacer */}
        <div className="flex-1" style={{ borderRight: "1px solid var(--line)" }} />

        {/* REV field */}
        <span className="bp-title-field hidden lg:flex flex-col gap-0" style={{ padding: "0 1rem" }}>
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "var(--ink-soft)", textTransform: "uppercase" }}>REV</span>
          <span style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>2026</span>
        </span>

        {/* Copyright */}
        <span
          className="bp-title-field"
          style={{ color: "var(--ink-soft)", fontSize: "0.65rem" }}
        >
          © {year}
        </span>

        {/* Stack field */}
        <span
          className="bp-title-field hidden sm:flex"
          style={{ color: "var(--ink-soft)", fontSize: "0.65rem", opacity: 0.6 }}
        >
          Next.js · Tailwind · Vercel
        </span>
      </div>
    </footer>
  );
}
