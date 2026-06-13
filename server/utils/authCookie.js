import {
  ACCESS_TOKEN_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";

const isProduction = () => process.env.NODE_ENV === "production";

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
    secure: crossSite,
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
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
};

/**
 * @param {import('express').Response} res
 */
export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
};

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export const getAuthTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken.trim();
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) {
      return bearer;
    }
  }

  return null;
};

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export const getRefreshTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken.trim();
  }

  const bodyToken = req.body?.refreshToken;
  if (typeof bodyToken === "string" && bodyToken.trim()) {
    return bodyToken.trim();
  }

  return null;
};
