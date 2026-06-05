export const PROFILE_IMAGE_FOCUS_MIN = 0;
export const PROFILE_IMAGE_FOCUS_MAX = 100;
export const PROFILE_IMAGE_FOCUS_DEFAULT = 50;

/** @typedef {{ x: number; y: number }} ProfileImageFocus */

export const DEFAULT_USER_AVATAR_FOCUS = {
  x: PROFILE_IMAGE_FOCUS_DEFAULT,
  y: PROFILE_IMAGE_FOCUS_DEFAULT,
};

export const DEFAULT_USER_BACKGROUND_FOCUS = {
  x: PROFILE_IMAGE_FOCUS_DEFAULT,
  y: PROFILE_IMAGE_FOCUS_DEFAULT,
};

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param {unknown} raw
 * @param {ProfileImageFocus} fallback
 * @returns {ProfileImageFocus}
 */
export function normalizeProfileImageFocus(raw, fallback) {
  const source =
    raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const x = Number(/** @type {{ x?: unknown }} */ (source).x ?? fallback.x);
  const y = Number(/** @type {{ y?: unknown }} */ (source).y ?? fallback.y);
  return {
    x: Math.round(
      clamp(
        Number.isFinite(x) ? x : fallback.x,
        PROFILE_IMAGE_FOCUS_MIN,
        PROFILE_IMAGE_FOCUS_MAX,
      ),
    ),
    y: Math.round(
      clamp(
        Number.isFinite(y) ? y : fallback.y,
        PROFILE_IMAGE_FOCUS_MIN,
        PROFILE_IMAGE_FOCUS_MAX,
      ),
    ),
  };
}

/**
 * @param {ProfileImageFocus} focus
 * @returns {string}
 */
export function formatProfileImageObjectPosition(focus) {
  const { x, y } = normalizeProfileImageFocus(focus, DEFAULT_USER_AVATAR_FOCUS);
  return `${x}% ${y}%`;
}

/**
 * @param {import('../model/types.js').UserPublicProfile | import('../model/types.js').UserSearchListItem | null | undefined} user
 * @returns {ProfileImageFocus}
 */
export function getUserAvatarFocus(user) {
  return normalizeProfileImageFocus(user?.userAvatarFocus, DEFAULT_USER_AVATAR_FOCUS);
}

/**
 * @param {import('../model/types.js').UserPublicProfile | import('../model/types.js').UserSearchListItem | null | undefined} user
 * @returns {ProfileImageFocus}
 */
export function getUserBackgroundFocus(user) {
  return normalizeProfileImageFocus(
    user?.userBackgroundFocus,
    DEFAULT_USER_BACKGROUND_FOCUS,
  );
}

/**
 * @param {unknown} url
 */
export function isHttpProfileImageUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}
