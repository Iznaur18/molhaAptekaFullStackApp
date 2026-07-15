/** Максимум слов для полей с лимитом по словам (не адрес). */
export const MAX_TEXT_FIELD_WORDS = 10;

/** Максимум символов для поля «О себе». */
export const NOTES_ABOUT_USER_MAX_CHARS = 500;

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
    throw new Error(`${fieldLabelRu}: не больше ${maxWords} слов (сейчас ${n})`);
  }
}

/**
 * @param {unknown} value
 * @param {string} fieldLabelRu
 * @param {number} minWords
 */
export function assertMinWords(value, fieldLabelRu, minWords) {
  const n = countWords(value);
  if (n < minWords) {
    throw new Error(`${fieldLabelRu}: не меньше ${minWords} слов (сейчас ${n})`);
  }
}

/**
 * @param {unknown} value
 * @param {string} fieldLabelRu
 * @param {number} [maxChars]
 */
export function assertAtMostChars(
  value,
  fieldLabelRu,
  maxChars = NOTES_ABOUT_USER_MAX_CHARS,
) {
  const length = value == null ? 0 : String(value).length;
  if (length > maxChars) {
    throw new Error(
      `${fieldLabelRu}: не больше ${maxChars} символов (сейчас ${length})`,
    );
  }
}
