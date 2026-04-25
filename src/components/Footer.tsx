export default function Footer() {
  return (
    <footer className="border-t py-10 px-8" style={{ borderColor: "var(--card-border)" }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--muted)" }}>
        <p>&copy; {new Date().getFullYear()} Tristan Sereño</p>
        <p className="font-mono">Built with Next.js + Tailwind CSS</p>
      </div>
    </footer>
  );
}
