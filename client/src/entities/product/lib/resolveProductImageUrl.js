import {
  isDisplayableProductImageUrl,
  resolveImageUrlForDisplay,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * Первый displayable URL обложки товара (массив + legacy).
 *
 * @param {unknown} product
 * @returns {string}
 */
export function resolveProductImageUrl(product) {
  if (!product || typeof product !== "object") {
    return "";
  }

  const source = /** @type {{ productImageUrls?: unknown; productImageUrl?: unknown }} */ (
    product
  );
  const fromArray = Array.isArray(source.productImageUrls)
    ? source.productImageUrls
    : [];

  for (const raw of fromArray) {
    const resolved = resolveImageUrlForDisplay(String(raw ?? "").trim());
    if (resolved && isDisplayableProductImageUrl(resolved)) {
      return resolved;
    }
  }

  if (typeof source.productImageUrl === "string" && source.productImageUrl.trim()) {
    const resolved = resolveImageUrlForDisplay(source.productImageUrl.trim());
    if (resolved && isDisplayableProductImageUrl(resolved)) {
      return resolved;
    }
  }

  return "";
}
