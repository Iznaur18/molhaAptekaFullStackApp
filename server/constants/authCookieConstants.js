/** httpOnly cookie с access JWT (короткий TTL). */
export const AUTH_COOKIE_NAME = "access_token";

/** httpOnly cookie с refresh JWT (длинный TTL). */
export const REFRESH_COOKIE_NAME = "refresh_token";

/** 1 час — access token. */
export const ACCESS_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;

/** 30 дней — refresh token. */
export const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
