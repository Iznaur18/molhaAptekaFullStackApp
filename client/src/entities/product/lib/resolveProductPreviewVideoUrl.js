import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 * @returns {string | null}
 */
export function resolveProductPreviewVideoUrl(product) {
  const raw = product?.productPreviewVideoUrl;
  if (raw == null || String(raw).trim() === "") return null;
  const resolved = resolveUploadedImageUrl(String(raw).trim());
  return resolved.trim() !== "" ? resolved : null;
}
