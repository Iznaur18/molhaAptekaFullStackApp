import { normalizeStoredUploadUrl } from "./buildPublicUploadUrl.js";

/**
 * @param {unknown} value
 */
export function isStoredBackgroundImageUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return false;
  }
  const normalized = normalizeStoredUploadUrl(raw);
  return (
    normalized.startsWith("/uploads/") || /^https?:\/\//i.test(normalized)
  );
}
