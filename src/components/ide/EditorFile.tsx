// One "open file" in the editor — a page section with a line-number gutter.
// Children mark numbered blocks with the `ln` class.
export default function EditorFile({
  id,
  label,
  plain = false,
  children,
}: {
  id: string;
  /** Accessible name for the section */
  label: string;
  /** Non-code editors (Welcome, Settings) have no line-number gutter */
  plain?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`ide-file ${plain ? "ide-file--plain" : ""}`} aria-label={label}>
      <div className="ide-file__inner">{children}</div>
    </section>
  );
}

// Markdown-style marker ("#", "##", ">") that screen readers skip
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="md-mark" aria-hidden="true">
      {children}
    </span>
  );
}
