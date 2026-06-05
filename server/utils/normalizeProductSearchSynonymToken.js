import { normalizeProductSearchText } from "./normalizeProductSearchText.js";

/**
 * @param {unknown} raw
 */
export const normalizeProductSearchSynonymToken = (raw) =>
  normalizeProductSearchText(raw).replace(/\s+/g, "");
