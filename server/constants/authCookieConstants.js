/** httpOnly cookie с access JWT (короткий TTL). */
export const AUTH_COOKIE_NAME = "access_token";

/** httpOnly cookie с refresh JWT (длинный TTL). */
export const REFRESH_COOKIE_NAME = "refresh_token";

/** 1 час — access token. */
export const ACCESS_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Refresh JWT + cookie: ~1 год (пока пользователь сам не нажмёт «Выйти»).
 * Должен совпадать с `expiresIn` в `signRefreshToken`.
 */
export const REFRESH_TOKEN_TTL_DAYS = 365;

/** Cookie maxAge для refresh — синхрон с JWT TTL. */
export const REFRESH_COOKIE_MAX_AGE_MS =
  REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
