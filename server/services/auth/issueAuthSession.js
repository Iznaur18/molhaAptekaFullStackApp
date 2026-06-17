import { setAuthCookie, setRefreshCookie } from "../../utils/authCookie.js";
import { signAccessToken, signRefreshToken } from "./authTokens.js";
import {
  bumpUserAuthTokenVersion,
  resolveUserAuthTokenVersion,
} from "./userAuthTokenVersion.js";

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
  const authTokenVersion = resolveUserAuthTokenVersion(user);
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId, authTokenVersion);
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  return buildAuthSessionData(user, accessToken, refreshToken);
};

/**
 * Refresh rotation: инкремент authTokenVersion и выдача новой пары токенов.
 *
 * @param {import('mongoose').Document | Record<string, unknown>} user
 * @param {import('express').Response} res
 */
export const issueRotatedAuthSession = async (user, res) => {
  const userId = String(user._id);
  const authTokenVersion = await bumpUserAuthTokenVersion(userId);
  const userWithVersion =
    typeof user.toObject === "function"
      ? { ...user.toObject(), authTokenVersion }
      : { ...user, authTokenVersion };
  return issueAuthSession(userWithVersion, res);
};
