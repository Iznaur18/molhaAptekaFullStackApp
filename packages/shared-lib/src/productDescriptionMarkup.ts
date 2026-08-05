export type ProductDescriptionBlock =
  | { type: "h1"; text: string }
  | { type: "paragraph"; text: string };

const H1_LINE_RE = /^#\s+(.*)$/;

/**
 * Markdown v1: строки вида `# Заголовок` → H1. Остальное — абзацы (plain).
 * @param {string | null | undefined} raw
 * @returns {ProductDescriptionBlock[]}
 */
export function parseProductDescriptionBlocks(
  raw: string | null | undefined,
): ProductDescriptionBlock[] {
  const source = String(raw ?? "").replace(/\r\n/g, "\n");
  if (!source.trim()) {
    return [];
  }

  const lines = source.split("\n");
  /** @type {ProductDescriptionBlock[]} */
  const blocks: ProductDescriptionBlock[] = [];
  /** @type {string[]} */
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
    paragraphLines = [];
  };

  for (const line of lines) {
    const match = line.match(H1_LINE_RE);
    if (match) {
      flushParagraph();
      blocks.push({ type: "h1", text: match[1] ?? "" });
      continue;
    }
    paragraphLines.push(line);
  }
  flushParagraph();
  return blocks;
}

/**
 * Текст без `# ` для превью карточек / модерации.
 * @param {string | null | undefined} raw
 */
export function formatProductDescriptionPlainText(
  raw: string | null | undefined,
): string {
  return parseProductDescriptionBlocks(raw)
    .map((block) => block.text)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type ToggleProductDescriptionH1Result = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/**
 * Кнопка H1: текущая строка (или выделение → одна строка) ↔ `# …`.
 */
export function toggleProductDescriptionH1(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): ToggleProductDescriptionH1Result {
  const text = String(value ?? "");
  let start = Math.max(0, Math.min(Number(selectionStart) || 0, text.length));
  let end = Math.max(0, Math.min(Number(selectionEnd) || 0, text.length));
  if (end < start) {
    const swap = start;
    start = end;
    end = swap;
  }

  if (start !== end) {
    const selected = text.slice(start, end).replace(/\r\n/g, "\n");
    const collapsed = selected.replace(/\n+/g, " ").trim();
    if (!collapsed) {
      return { value: text, selectionStart: start, selectionEnd: end };
    }
    const bare = collapsed.match(H1_LINE_RE)?.[1]?.trim() ?? collapsed;
    const nextChunk = collapsed.startsWith("# ") ? bare : `# ${bare}`;
    const next = text.slice(0, start) + nextChunk + text.slice(end);
    return {
      value: next,
      selectionStart: start,
      selectionEnd: start + nextChunk.length,
    };
  }

  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = text.indexOf("\n", start);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const line = text.slice(lineStart, lineEnd);
  const h1Match = line.match(H1_LINE_RE);

  if (h1Match) {
    const bare = h1Match[1] ?? "";
    const next = text.slice(0, lineStart) + bare + text.slice(lineEnd);
    const cursor = Math.min(start - 2, lineStart + bare.length);
    return {
      value: next,
      selectionStart: Math.max(lineStart, cursor),
      selectionEnd: Math.max(lineStart, cursor),
    };
  }

  const nextLine = `# ${line}`;
  const next = text.slice(0, lineStart) + nextLine + text.slice(lineEnd);
  return {
    value: next,
    selectionStart: lineStart + 2,
    selectionEnd: lineStart + nextLine.length,
  };
}
