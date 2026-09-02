import {
  parseInstagramPostUrl,
  PRODUCT_INSTAGRAM_POST_URL_INVALID_MESSAGE,
} from "@molha/api-contract";

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeProductInstagramPostUrl(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return "";
  }

  const parsed = parseInstagramPostUrl(trimmed);
  if (!parsed) {
    throw new Error(PRODUCT_INSTAGRAM_POST_URL_INVALID_MESSAGE);
  }

  return parsed.postUrl;
}
