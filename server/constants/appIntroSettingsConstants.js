export const APP_INTRO_SETTINGS_KEY = "default";

export const APP_INTRO_FALLBACK_TITLE_DEFAULT = "Torgum";
export const APP_INTRO_FALLBACK_HINT_DEFAULT = "Добро пожаловать";

export const APP_INTRO_MIN_MS_DEFAULT = 2000;
export const APP_INTRO_MAX_MS_DEFAULT = 8000;
export const APP_INTRO_FADE_OUT_MS_DEFAULT = 550;

export const APP_INTRO_FALLBACK_TITLE_MAX_LENGTH = 80;
export const APP_INTRO_FALLBACK_HINT_MAX_LENGTH = 200;

export const APP_INTRO_MIN_MS_MIN = 500;
export const APP_INTRO_MIN_MS_MAX = 30_000;
export const APP_INTRO_MAX_MS_MIN = 1000;
export const APP_INTRO_MAX_MS_MAX = 60_000;
export const APP_INTRO_FADE_OUT_MS_MIN = 100;
export const APP_INTRO_FADE_OUT_MS_MAX = 2000;

/** Лимит intro-видео (MB в спеке — 10). */
export const APP_INTRO_VIDEO_MAX_BYTES = 10 * 1024 * 1024;

/** Синхрон с contract INTRO_AD_VIDEO_MAX_DURATION_SEC: intro-видео обрезается при загрузке. */
export const APP_INTRO_VIDEO_MAX_DURATION_SEC = 10;

/** Потолок видеобитрейта intro после перекодировки: 10 c * 5 Мбит/с ≈ 6-7 МБ на диске. */
export const APP_INTRO_VIDEO_MAX_BITRATE_MBIT = 5;
