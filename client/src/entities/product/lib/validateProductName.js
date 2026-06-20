import {
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
} from "../model/productConstants.js";

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function validateProductName(raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < PRODUCT_NAME_MIN_LENGTH) {
    return `Название: не короче ${PRODUCT_NAME_MIN_LENGTH} символов`;
  }
  if (trimmed.length > PRODUCT_NAME_MAX_LENGTH) {
    return `Название: не больше ${PRODUCT_NAME_MAX_LENGTH} символов`;
  }
  return null;
}
