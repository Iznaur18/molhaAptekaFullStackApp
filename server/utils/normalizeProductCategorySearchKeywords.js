import { normalizeProductSearchText } from "./normalizeProductSearchText.js";

/**
 * @param {unknown} keywords
 * @returns {string[]}
 */
export const normalizeProductCategorySearchKeywords = (keywords) => {
  if (!Array.isArray(keywords)) return [];

  const unique = new Set();
  for (const raw of keywords) {
    const normalized = normalizeProductSearchText(raw);
    if (normalized) unique.add(normalized);
  }

  return [...unique];
};
