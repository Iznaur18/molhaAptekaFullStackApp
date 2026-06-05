import { PRODUCT_IMAGE_URLS_MAX } from "../model/productConstants.js";
import {
  resolveImageUrlForDisplay,
  isHttpImageUrl,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * Нормализованный список URL изображений (новое поле + legacy `productImageUrl`).
 *
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 * @returns {string[]}
 */
export function resolveProductImageUrls(product) {
  if (!product) return [];
  const fromArr = Array.isArray(product.productImageUrls)
    ? product.productImageUrls
    : [];
  const cleaned = fromArr
    .map((s) => resolveImageUrlForDisplay(String(s).trim()))
    .filter((u) => isHttpImageUrl(u))
    .slice(0, PRODUCT_IMAGE_URLS_MAX);
  if (cleaned.length > 0) return cleaned;
  const leg = product.productImageUrl;
  if (typeof leg === "string" && isHttpImageUrl(leg.trim())) {
    return [resolveImageUrlForDisplay(leg.trim())];
  }
  return [];
}
