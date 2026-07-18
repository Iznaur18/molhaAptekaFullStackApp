import { USER_DATA } from "../../constants/constants.js";
import { shouldIncludeAuthTokensInBody } from "../../constants/authClientConstants.js";
import { setAuthCookie, setRefreshCookie } from "../../utils/authCookie.js";
import { signAccessToken, signRefreshToken } from "./authTokens.js";
import {
  bumpUserAuthTokenVersion,
  resolveUserAuthTokenVersion,
} from "./userAuthTokenVersion.js";

const AUTH_RESPONSE_USER_FIELDS = USER_DATA.split(/\s+/).filter(Boolean);

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 */
const toPlainUserRecord = (user) => {
  if (user && typeof user.toObject === "function") {
    return user.toObject();
  }
  if (user && typeof user.toJSON === "function") {
    return user.toJSON();
  }
  return { ...user };
};

/**
 * Whitelist публичных полей — никогда не отдаём passwordHash / verification secrets,
 * даже если документ был загружен с `select("+passwordHash")`.
 *
 * @param {import('mongoose').Document | Record<string, unknown>} user
 */
export const serializeUserForAuthResponse = (user) => {
  const raw = toPlainUserRecord(user);
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const field of AUTH_RESPONSE_USER_FIELDS) {
    if (raw[field] !== undefined) {
      out[field] = raw[field];
    }
  }
  return out;
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} user
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {import('express').Request | null | undefined} [req]
 */
export const buildAuthSessionData = (user, accessToken, refreshToken, req) => {
  const data = serializeUserForAuthResponse(user);
  if (shouldIncludeAuthTokensInBody(req)) {
    data.accessToken = accessToken;
    data.refreshToken = refreshToken;
  }
  return data;
};

/**
 * Cookies для web + токены в JSON только для mobile (`X-Auth-Client: mobile`).
 *
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 * @param {import('express').Request | null | undefined} [req]
 */
export const issueAuthSession = (user, res, req) => {
  const userId = user._id.toString();
  const authTokenVersion = resolveUserAuthTokenVersion(user);
  const accessToken = signAccessToken(userId, authTokenVersion);
  const refreshToken = signRefreshToken(userId, authTokenVersion);
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  return buildAuthSessionData(user, accessToken, refreshToken, req);
};

/**
 * Refresh rotation: инкремент authTokenVersion и выдача новой пары токенов.
 *
 * @param {import('mongoose').Document | Record<string, unknown>} user
 * @param {import('express').Response} res
 * @param {import('express').Request | null | undefined} [req]
 */
export const issueRotatedAuthSession = async (user, res, req) => {
  const userId = String(user._id);
  const authTokenVersion = await bumpUserAuthTokenVersion(userId);
  const userWithVersion =
    typeof user.toObject === "function"
      ? { ...user.toObject(), authTokenVersion }
      : { ...user, authTokenVersion };
  return issueAuthSession(userWithVersion, res, req);
};
