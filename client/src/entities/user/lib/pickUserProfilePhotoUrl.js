import {
  resolveImageUrlForDisplay,
  isHttpImageUrl,
  isStoredUploadOrHttpImageUrl,
} from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * URL фото для аватара: основной аватар профиля, иначе фото из Telegram.
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

  if (isHttpImageUrl(user.telegramPhotoUrl)) {
    return user.telegramPhotoUrl.trim();
  }

  return null;
}
