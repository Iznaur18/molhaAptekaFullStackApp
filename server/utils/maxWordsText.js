/** Максимум слов для полей профиля (адрес, заметки). */
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
 * @param {number} [maxWords]
 */
export function assertAtMostWords(
  value,
  fieldLabelRu,
  maxWords = MAX_TEXT_FIELD_WORDS,
) {
  const n = countWords(value);
  if (n > maxWords) {
    throw new Error(
      `${fieldLabelRu}: не больше ${maxWords} слов (сейчас ${n})`,
    );
  }
}
