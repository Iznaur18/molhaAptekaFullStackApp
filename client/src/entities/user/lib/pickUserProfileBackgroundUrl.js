import { resolveImageUrlForDisplay, isHttpImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @returns {string | null}
 */
export function pickUserProfileBackgroundUrl(user) {
  if (!user) return null;
  if (isHttpImageUrl(user.userBackgroundUrl)) {
    return resolveImageUrlForDisplay(user.userBackgroundUrl);
  }
  return null;
}
