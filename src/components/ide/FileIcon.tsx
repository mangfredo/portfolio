import type { FileKind } from "./files";

const glyph: Record<FileKind, string> = {
  md: "M↓",
  ts: "TS",
  json: "{}",
  log: "≡",
  folder: "▸",
  ext: "⧉",
  welcome: "◈",
  settings: "⚙",
  task: "▶",
};

export default function FileIcon({ kind, open = false }: { kind: FileKind; open?: boolean }) {
  return (
    <span className={`ide-ficon ide-ficon--${kind}`} aria-hidden="true">
      {kind === "folder" && open ? "▾" : glyph[kind]}
    </span>
  );
}
