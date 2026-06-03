export const AUTH_COOKIE_NAME = 'access_token';

/** 30 days in ms — sync with JWT expiresIn in sendUserWithToken */
export const AUTH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
