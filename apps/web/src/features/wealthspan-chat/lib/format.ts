/** "Today, 7:18 AM" style stamp above the first message. */
export function stamp(at: number): string {
  const d = new Date(at);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  const days = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (days <= 0) return `Today, ${time.toUpperCase()}`;
  if (days === 1) return `Yesterday, ${time.toUpperCase()}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time.toUpperCase()}`;
}

export type Block = { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

/** Plain-text reply to paragraphs and lists (the assistant answers in light markdown). */
export function toBlocks(text: string): Block[] {
  const out: Block[] = [];
  for (const chunk of text.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    const bullet = lines.every((l) => /^\s*[-*•]\s+/.test(l));
    const numbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
    if (bullet) out.push({ kind: "ul", items: lines.map((l) => l.replace(/^\s*[-*•]\s+/, "")) });
    else if (numbered)
      out.push({ kind: "ol", items: lines.map((l) => l.replace(/^\s*\d+[.)]\s+/, "")) });
    else out.push({ kind: "p", text: lines.join("\n") });
  }
  return out;
}

/** Splits `**bold**` runs so the thread can render them without raw HTML. */
export function boldParts(text: string): { bold: boolean; text: string }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((p) =>
      p.startsWith("**") && p.endsWith("**")
        ? { bold: true, text: p.slice(2, -2) }
        : { bold: false, text: p },
    );
}
