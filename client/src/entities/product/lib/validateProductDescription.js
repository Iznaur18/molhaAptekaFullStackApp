import { countWords } from "../../user/lib/countWords.js";
import { PRODUCT_DESCRIPTION_MAX_WORDS } from "../model/productConstants.js";

const DESCRIPTION_MIN_CHARS = 10;

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function validateProductDescription(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < DESCRIPTION_MIN_CHARS) {
    return `Описание: не короче ${DESCRIPTION_MIN_CHARS} символов`;
  }
  const words = countWords(trimmed);
  if (words > PRODUCT_DESCRIPTION_MAX_WORDS) {
    return `Описание: не больше ${PRODUCT_DESCRIPTION_MAX_WORDS} слов (сейчас ${words})`;
  }
  return null;
}
