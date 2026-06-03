import {
  resolveImageUrlForDisplay,
  isStoredUploadOrHttpImageUrl,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * URL фото для аватара профиля.
 *
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @returns {string | null}
 */
export function pickUserProfilePhotoUrl(user) {
  if (!user) return null;

  const avatarUrl = String(user.userAvatarUrl ?? "").trim();
  if (avatarUrl && isStoredUploadOrHttpImageUrl(avatarUrl)) {
    return resolveImageUrlForDisplay(avatarUrl);
  }

  return null;
}
