// Splits "plain **highlighted** plain" copy into segments for rendering
export function splitEmphasis(text: string): { text: string; em: boolean }[] {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((t, i) => ({ text: t, em: i % 2 === 1 }))
    .filter((s) => s.text);
}
