/**
 * Нормализация текста для поиска и productSearchBlob.
 *
 * @param {unknown} value
 * @returns {string}
 */
export const normalizeProductSearchText = (value) => {
  if (value == null) return "";
  const raw = String(value).trim().toLowerCase().replace(/ё/g, "е");
  return raw.replace(/\s+/g, " ");
};

/**
 * @param {string} term
 * @returns {string[]}
 */
export const tokenizeProductSearchTerm = (term) => {
  const normalized = normalizeProductSearchText(term);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
};
