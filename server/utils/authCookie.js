import {
  ACCESS_TOKEN_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * @param {unknown} value
 * @returns {string | null}
 */
const readTrimmedRequestToken = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

/** SameSite=None для cross-origin (client и API на разных доменах). */
const isCrossSiteCookie = () =>
  String(process.env.COOKIE_CROSS_SITE ?? "").toLowerCase() === "true";

/**
 * @param {number} maxAgeMs
 */
const getCookieOptions = (maxAgeMs) => {
  const crossSite = isProduction() && isCrossSiteCookie();
  return {
    httpOnly: true,
    // В production куки только по HTTPS независимо от режима (same-site/cross-site).
    secure: isProduction(),
    sameSite: crossSite ? "none" : "lax",
    maxAge: maxAgeMs,
    path: "/",
  };
};

/**
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
};

/**
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, getCookieOptions(REFRESH_COOKIE_MAX_AGE_MS));
};

/**
 * Атрибуты удаления должны совпадать с атрибутами установки: при
 * SameSite=None; Secure браузер отвергнет стирающую Set-Cookie с Lax/без
 * Secure, и кука логина переживёт logout.
 */
const getClearCookieOptions = () => {
  const { maxAge: _maxAge, ...rest } = getCookieOptions(0);
  return rest;
};

/**
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
};

/**
 * @param {import('express').Response} res
 */
export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions());
};

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export const getAuthTokenFromRequest = (req) => {
  const cookieToken = readTrimmedRequestToken(req.cookies?.[AUTH_COOKIE_NAME]);
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return readTrimmedRequestToken(authHeader.slice(7));
  }

  return null;
};

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export const getRefreshTokenFromRequest = (req) => {
  const bodyToken = readTrimmedRequestToken(req.body?.refreshToken);
  if (bodyToken) {
    return bodyToken;
  }

  return readTrimmedRequestToken(req.cookies?.[REFRESH_COOKIE_NAME]);
};
