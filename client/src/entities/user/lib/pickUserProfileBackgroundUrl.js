import {
  isStoredUploadOrHttpImageUrl,
  resolveImageUrlForDisplay,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @returns {string | null}
 */
export function pickUserProfileBackgroundUrl(user) {
  if (!user) return null;
  const raw = String(user.userBackgroundUrl ?? "").trim();
  if (raw && isStoredUploadOrHttpImageUrl(raw)) {
    return resolveImageUrlForDisplay(raw);
  }
  return null;
}
