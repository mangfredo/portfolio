export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-8 pt-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }} />
      </div>

      <div className="relative max-w-4xl text-center">
        <div className="w-40 h-40 mx-auto mb-8 rounded-full border-2 overflow-hidden select-none pointer-events-none" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <img src="/profile.jpg" alt="Tristan Sereño" className="w-full h-full object-cover select-none" draggable="false" />
        </div>

        <p className="sel-invert font-mono text-base mb-5 tracking-widest uppercase" style={{ color: "var(--accent)" }}>
          Software Engineer · Web Developer · Automation-Focused
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-3">
          Tristan Sereño
        </h1>
        <p className="text-base mb-8 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
          I build automation tools and internal systems that reduce manual workflows and improve team efficiency.
        </p>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: "var(--muted)" }}>
          I bridge the gap between complex business logic and high-performance
          engineering. With 5+ years of full-stack expertise, I specialize in
          building agentic systems that eliminate operational friction — most
          recently delivering a{" "}
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>97% efficiency surge</span>{" "}
          by transforming a 6-hour manual workflow into a sub-10-minute automated
          reality.
        </p>
        <div className="flex flex-wrap gap-5 justify-center mb-8">
          <a href="#projects" className="sel-btn sel-invert px-8 py-4 text-white text-base font-medium rounded-lg transition-all select-none" style={{ background: "var(--accent)" }}>
            View Projects
          </a>
          <a href="#scripts" className="sel-btn sel-btn-outline px-8 py-4 border text-base font-medium rounded-lg transition-all select-none" style={{ borderColor: "var(--card-border)" }}>
            Explore Scripts
          </a>
        </div>

        <div className="flex items-center justify-center gap-8 text-base" style={{ color: "var(--muted)" }}>
          <a
            href="https://www.linkedin.com/in/tristan-sere%C3%B1o-9b1b662a3/"
            target="_blank"
            rel="noopener noreferrer"
            className="sel-invert flex items-center gap-2 transition-colors hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
          <span className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            09919036289
          </span>
        </div>
      </div>
    </section>
  );
}
