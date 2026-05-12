/** Максимум слов для длинных текстовых полей (описание товара, заметки в профиле). */
export const MAX_TEXT_FIELD_WORDS = 10;

/**
 * Число слов по пробельным разделителям (последовательности непробельных символов).
 * @param {unknown} raw
 */
export function countWords(raw) {
  if (raw == null) return 0;
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * @param {unknown} value
 * @param {string} fieldLabelRu — подпись для сообщения об ошибке
 */
export function assertAtMostWords(value, fieldLabelRu) {
  const n = countWords(value);
  if (n > MAX_TEXT_FIELD_WORDS) {
    throw new Error(
      `${fieldLabelRu}: не больше ${MAX_TEXT_FIELD_WORDS} слов (сейчас ${n})`,
    );
  }
}
