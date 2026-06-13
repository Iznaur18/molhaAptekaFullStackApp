import { setAuthCookie, setRefreshCookie } from "./authCookie.js";
import { signAccessToken, signRefreshToken } from "./authTokens.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 */
export const serializeUserForAuthResponse = (user) => {
  if (user && typeof user.toJSON === "function") {
    return user.toJSON();
  }
  if (user && typeof user.toObject === "function") {
    return user.toObject();
  }
  return { ...user };
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const buildAuthSessionData = (user, accessToken, refreshToken) => ({
  ...serializeUserForAuthResponse(user),
  accessToken,
  refreshToken,
});

/**
 * Cookies для web + токены в JSON для mobile (Bearer).
 *
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 */
export const issueAuthSession = (user, res) => {
  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  return buildAuthSessionData(user, accessToken, refreshToken);
};
