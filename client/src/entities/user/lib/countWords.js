/**
 * Число слов по пробельным разделителям (как на сервере `maxWordsText.js`).
 * @param {unknown} raw
 */
export function countWords(raw) {
  if (raw == null) return 0;
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
