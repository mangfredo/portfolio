export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end pb-20 sm:pb-28 px-6 sm:px-10 pt-24 overflow-hidden">
      {/* Subtle gradient wash — asymmetric, not centered */}
      <div
        className="absolute top-0 right-0 w-[70%] h-[80%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 80% 20%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[50%] h-[40%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 20% 90%, color-mix(in srgb, var(--terracotta) 5%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-20 items-end">
        {/* Left — Text heavy, asymmetric */}
        <div>
          <p
            className="sel-invert font-mono text-xs tracking-[0.25em] uppercase mb-6"
            style={{ color: "var(--accent-bright)" }}
          >
            Software Engineer · Full-Stack Developer
          </p>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            I build the tools
            <br />
            that build the
            <br />
            <span style={{ color: "var(--terracotta)" }}>product.</span>
          </h1>

          <p
            className="text-lg sm:text-xl leading-relaxed max-w-xl mb-10"
            style={{ color: "var(--fg-muted)" }}
          >
            5+ years turning complex business problems into clean, fast systems.
            One recent project cut a 6-hour manual process down to under 10
            minutes — a{" "}
            <span className="font-medium" style={{ color: "var(--fg)" }}>
              97% efficiency gain
            </span>{" "}
            that freed the team to focus on work that actually matters.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className="sel-btn sel-invert magnetic-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              See the work
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <a
              href="#automation"
              className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md border transition-colors hover:border-[var(--accent)]"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--fg-muted)",
              }}
            >
              Automation suite
            </a>
          </div>
        </div>

        {/* Right — Photo + Terminal */}
        <div className="hidden md:flex flex-col items-center justify-between gap-6 relative w-full h-full">
          {/* Profile photo */}
          <div
            className="w-48 h-48 rounded-full overflow-hidden border-2 select-none pointer-events-none shrink-0"
            style={{
              borderColor: "var(--accent)",
              boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            <img
              src="/profile.jpg"
              alt="Tristan Sereño"
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>

          {/* Terminal */}
          <div
            className="rounded-lg border overflow-hidden w-full"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            {/* Terminal header */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: "var(--card-border)" }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "#ff5f57" }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "#febc2e" }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "#28c840" }}
              />
              <span
                className="ml-3 font-mono text-xs"
                style={{ color: "var(--fg-muted)" }}
              >
                ~/projects/offer-letter-engine
              </span>
            </div>

            {/* Terminal body */}
            <div className="p-5 font-mono text-sm leading-relaxed">
              <p style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent-bright)" }}>$</span> node
                generate --template WD_SWE_Contract
              </p>
              <p className="mt-2" style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent)" }}>→</span> Parsing
                document structure...
              </p>
              <p style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent)" }}>→</span> Extracting
                conditions (47 rules)
              </p>
              <p style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent)" }}>→</span> Compiling
                placeholders...
              </p>
              <p style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent)" }}>→</span> Validating
                output against schema
              </p>
              <p className="mt-2" style={{ color: "var(--accent-bright)" }}>
                ✓ Generated production-ready JS in 8.2s
              </p>
              <p style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: "var(--accent-bright)" }}>$</span>{" "}
                <span className="cursor-blink">▊</span>
              </p>
            </div>
          </div>

          {/* Annotation — hand-drawn feel */}
          <div
            className="absolute -bottom-8 -left-4 font-mono text-xs rotate-[-2deg]"
            style={{ color: "var(--fg-muted)" }}
          >
            ↑ this used to take 6 hours by hand
          </div>
        </div>
      </div>
    </section>
  );
}
