function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 * @returns {string | null}
 */
export function pickUserProfileBackgroundUrl(user) {
  if (!user) return null;
  if (isHttpUrl(user.userBackgroundUrl)) return user.userBackgroundUrl.trim();
  return null;
}
