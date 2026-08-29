import { createHash } from "node:crypto";

const INLINE_SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

/**
 * Инлайн-скрипт (без `src`) под `script-src 'self'` браузер блокирует, поэтому
 * для каждого такого блока в index.html нужен `'sha256-…'` в CSP.
 * Хэш считается по тексту между тегами, CRLF нормализуется в LF: HTML-парсер
 * делает это при разборе документа, и браузер хэширует уже нормализованный текст
 * (иначе dist, собранный на Windows, даёт хэш, которого нет в CSP).
 *
 * @param {string} html
 * @returns {string[]} источники вида `'sha256-…'` (без дублей, в порядке в html)
 */
export function inlineScriptCspHashes(html) {
  const source = String(html ?? "");
  const hashes = [];

  for (const [, attrs, code] of source.matchAll(INLINE_SCRIPT_RE)) {
    if (/\bsrc\s*=/i.test(attrs)) {
      continue;
    }
    if (!code.trim()) {
      continue;
    }

    const normalized = code.replace(/\r\n?/g, "\n");
    const digest = createHash("sha256").update(normalized, "utf8").digest("base64");
    const value = `'sha256-${digest}'`;
    if (!hashes.includes(value)) {
      hashes.push(value);
    }
  }

  return hashes;
}
