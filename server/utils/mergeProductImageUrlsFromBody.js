import { PRODUCT_IMAGE_URLS_MAX } from "../constants/productConstants.js";

/**
 * Собирает `productImageUrls` из тела `POST /product`: массив и при пустом — legacy `productImageUrl`.
 *
 * @param {{ productImageUrls?: unknown; productImageUrl?: unknown }} body
 * @returns {string[]}
 */
export function mergeProductImageUrlsFromBody(body) {
  const rawList = Array.isArray(body.productImageUrls) ? body.productImageUrls : [];
  const fromArray = rawList.map((u) => String(u).trim()).filter((u) => u.length > 0);
  const legacy =
    typeof body.productImageUrl === "string" && body.productImageUrl.trim()
      ? [body.productImageUrl.trim()]
      : [];
  const merged = (fromArray.length > 0 ? fromArray : legacy).slice(
    0,
    PRODUCT_IMAGE_URLS_MAX,
  );
  return merged;
}
