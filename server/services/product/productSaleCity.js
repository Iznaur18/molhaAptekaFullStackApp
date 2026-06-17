import { PRODUCT_SALE_CITY_MAX_LENGTH } from "../../constants/addressStructuredConstants.js";

/**
 * @param {unknown} raw
 */
export function normalizeProductSaleCity(raw) {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (trimmed === "") return "";
  if (trimmed.length > PRODUCT_SALE_CITY_MAX_LENGTH) {
    throw new Error(
      `Город продажи не длиннее ${PRODUCT_SALE_CITY_MAX_LENGTH} символов`,
    );
  }
  return trimmed;
}
