import { COMMON_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function isCatalogPromotionActive(product) {
  const raw = product?.catalogPromotionExpiresAt;
  if (!raw) {
    return false;
  }
  return new Date(raw).getTime() > Date.now();
}

/**
 * @param {string | null | undefined} expiresAt
 * @param {string} [locale]
 */
export function formatPromotionExpiresAt(expiresAt, locale = COMMON_UI.LOCALE_RU) {
  if (!expiresAt) {
    return "";
  }
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
