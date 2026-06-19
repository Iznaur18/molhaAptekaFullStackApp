export const PROFILE_IMAGE_FOCUS_MIN = 0;
export const PROFILE_IMAGE_FOCUS_MAX = 100;
export const PROFILE_IMAGE_FOCUS_DEFAULT = 50;

export type ProfileImageFocus = {
  x: number;
  y: number;
};

export const DEFAULT_USER_AVATAR_FOCUS: ProfileImageFocus = {
  x: PROFILE_IMAGE_FOCUS_DEFAULT,
  y: PROFILE_IMAGE_FOCUS_DEFAULT,
};

export const DEFAULT_USER_BACKGROUND_FOCUS: ProfileImageFocus = {
  x: PROFILE_IMAGE_FOCUS_DEFAULT,
  y: PROFILE_IMAGE_FOCUS_DEFAULT,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeProfileImageFocus = (
  raw: unknown,
  fallback: ProfileImageFocus,
): ProfileImageFocus => {
  const source = raw != null && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const record = source as { x?: unknown; y?: unknown };
  const x = Number(record.x ?? fallback.x);
  const y = Number(record.y ?? fallback.y);

  return {
    x: Math.round(
      clamp(Number.isFinite(x) ? x : fallback.x, PROFILE_IMAGE_FOCUS_MIN, PROFILE_IMAGE_FOCUS_MAX),
    ),
    y: Math.round(
      clamp(Number.isFinite(y) ? y : fallback.y, PROFILE_IMAGE_FOCUS_MIN, PROFILE_IMAGE_FOCUS_MAX),
    ),
  };
};

export const formatProfileImageContentPosition = (focus: ProfileImageFocus) => ({
  left: `${focus.x}%`,
  top: `${focus.y}%`,
});

export const getUserAvatarFocus = (user: Record<string, unknown> | null | undefined) =>
  normalizeProfileImageFocus(user?.userAvatarFocus, DEFAULT_USER_AVATAR_FOCUS);

export const getUserBackgroundFocus = (user: Record<string, unknown> | null | undefined) =>
  normalizeProfileImageFocus(user?.userBackgroundFocus, DEFAULT_USER_BACKGROUND_FOCUS);
