import { UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { issueRotatedAuthSession } from "./issueAuthSession.js";
import { verifyRefreshToken } from "./authTokens.js";
import { isRefreshTokenVersionValid } from "./userAuthTokenVersion.js";
import {
  BLOCKED_ACCOUNT_MESSAGE,
  DISABLED_ACCOUNT_MESSAGE,
} from "../../middlewares/checkAuthMW.js";
import { logSecurityEvent, securityRequestFields } from "./logSecurityEvent.js";

/**
 * Сообщения refresh оставлены как были (EN): client матчит
 * `Refresh token required` в apiClient.
 */
const MSG_REFRESH_REQUIRED = "Refresh token required";
const MSG_REFRESH_INVALID = "Invalid refresh token";
const MSG_USER_NOT_FOUND = "User not found";
const MSG_REFRESH_REVOKED = "Refresh token revoked";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} reason
 * @param {Record<string, unknown>} [extra]
 */
function clearSessionAndLog(req, res, reason, extra = {}) {
  clearAuthCookie(res);
  clearRefreshCookie(res);
  logSecurityEvent("warn", "refresh_failed", {
    ...securityRequestFields(req),
    reason,
    ...extra,
  });
}

/**
 * Ротация access/refresh по cookie (или body) refresh-токена.
 *
 * @param {{ req: import('express').Request, res: import('express').Response }} args
 */
export async function refreshAuthSession({ req, res }) {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) {
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "missing_token",
    });
    throw new AppError(401, MSG_REFRESH_REQUIRED);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    clearSessionAndLog(req, res, "invalid_token");
    throw new AppError(401, MSG_REFRESH_INVALID);
  }

  const user = await UserModel.findById(decoded._id).select(
    "+authTokenVersion isBlockedUser isActiveUser",
  );
  if (!user) {
    clearSessionAndLog(req, res, "user_not_found");
    throw new AppError(401, MSG_USER_NOT_FOUND);
  }

  if (!isRefreshTokenVersionValid(decoded.tv, user)) {
    clearSessionAndLog(req, res, "revoked", { userId: String(user._id) });
    throw new AppError(401, MSG_REFRESH_REVOKED);
  }

  if (user.isBlockedUser) {
    clearSessionAndLog(req, res, "blocked", { userId: String(user._id) });
    throw new AppError(403, BLOCKED_ACCOUNT_MESSAGE);
  }

  if (user.isActiveUser === false) {
    clearSessionAndLog(req, res, "disabled", { userId: String(user._id) });
    throw new AppError(403, DISABLED_ACCOUNT_MESSAGE);
  }

  const data = await issueRotatedAuthSession(user, res, req);
  logSecurityEvent("info", "refresh_ok", {
    ...securityRequestFields(req),
    userId: String(user._id),
  });
  return data;
}
