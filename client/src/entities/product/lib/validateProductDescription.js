import {
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
} from "../model/productConstants.js";

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function validateProductDescription(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < PRODUCT_DESCRIPTION_MIN_CHARS) {
    return `Описание: не короче ${PRODUCT_DESCRIPTION_MIN_CHARS} символов`;
  }
  if (trimmed.length > PRODUCT_DESCRIPTION_MAX_CHARS) {
    return `Описание: не больше ${PRODUCT_DESCRIPTION_MAX_CHARS} символов`;
  }
  return null;
}
