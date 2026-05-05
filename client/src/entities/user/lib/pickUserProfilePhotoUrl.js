function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * URL фото для аватара: основной аватар профиля, иначе фото из Telegram.
 *
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @returns {string | null}
 */
export function pickUserProfilePhotoUrl(user) {
  if (!user) return null;
  if (isHttpUrl(user.userAvatarUrl)) return user.userAvatarUrl.trim();
  if (isHttpUrl(user.telegramPhotoUrl)) return user.telegramPhotoUrl.trim();
  return null;
}
