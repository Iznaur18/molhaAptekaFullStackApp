import {
  DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
  DEFAULT_USER_AVATAR_FOCUS,
  DEFAULT_USER_BACKGROUND_FOCUS,
  PROFILE_IMAGE_FOCUS_MAX,
  PROFILE_IMAGE_FOCUS_MIN,
} from "../../constants/profileImageFocusConstants.js";

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param {unknown} raw
 * @param {{ x: number; y: number }} fallback
 */
export function normalizeProfileImageFocus(raw, fallback) {
  const xRaw = raw != null && typeof raw === "object" ? raw.x : undefined;
  const yRaw = raw != null && typeof raw === "object" ? raw.y : undefined;
  const x = Number(xRaw ?? fallback.x);
  const y = Number(yRaw ?? fallback.y);
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
 * @param {unknown} raw
 * @param {string} label
 */
export function assertProfileImageFocus(raw, label) {
  if (raw === undefined || raw === null) {
    return;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${label}: ожидается объект { x, y }`);
  }
  const x = Number(raw.x);
  const y = Number(raw.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`${label}: x и y должны быть числами`);
  }
  if (
    x < PROFILE_IMAGE_FOCUS_MIN ||
    x > PROFILE_IMAGE_FOCUS_MAX ||
    y < PROFILE_IMAGE_FOCUS_MIN ||
    y > PROFILE_IMAGE_FOCUS_MAX
  ) {
    throw new Error(
      `${label}: x и y от ${PROFILE_IMAGE_FOCUS_MIN} до ${PROFILE_IMAGE_FOCUS_MAX}`,
    );
  }
}

export function normalizeUserAvatarFocus(raw) {
  return normalizeProfileImageFocus(raw, DEFAULT_USER_AVATAR_FOCUS);
}

export function normalizeUserBackgroundFocus(raw) {
  return normalizeProfileImageFocus(raw, DEFAULT_USER_BACKGROUND_FOCUS);
}

export function normalizeRafflePrizeImageFocus(raw) {
  return normalizeProfileImageFocus(raw, DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS);
}
