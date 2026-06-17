import { PRODUCT_IMAGE_URLS_MAX } from "../../constants/productConstants.js";
import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";

/**
 * Собирает `productImageUrls` из тела `POST /product`: массив и при пустом — legacy `productImageUrl`.
 * Канонизирует `/uploads/...` — без привязки к dev IP/host браузера.
 *
 * @param {{ productImageUrls?: unknown; productImageUrl?: unknown }} body
 * @returns {string[]}
 */
export function mergeProductImageUrlsFromBody(body) {
  const rawList = Array.isArray(body.productImageUrls) ? body.productImageUrls : [];
  const fromArray = rawList
    .map((u) => normalizeStoredUploadUrl(String(u).trim()))
    .filter((u) => u.length > 0);
  const legacy =
    typeof body.productImageUrl === "string" && body.productImageUrl.trim()
      ? [normalizeStoredUploadUrl(body.productImageUrl.trim())]
      : [];
  const merged = (fromArray.length > 0 ? fromArray : legacy).slice(
    0,
    PRODUCT_IMAGE_URLS_MAX,
  );
  return merged;
}
