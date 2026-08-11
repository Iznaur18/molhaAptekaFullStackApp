import { UserModel } from "../../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { issueRotatedAuthSession } from "../../services/auth/issueAuthSession.js";
import { verifyRefreshToken } from "../../services/auth/authTokens.js";
import { isRefreshTokenVersionValid } from "../../services/auth/userAuthTokenVersion.js";
import {
  BLOCKED_ACCOUNT_MESSAGE,
  DISABLED_ACCOUNT_MESSAGE,
} from "../../middlewares/checkAuthMW.js";
import {
  logSecurityEvent,
  securityRequestFields,
} from "../../services/auth/logSecurityEvent.js";

export const refreshAuthController = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) {
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "missing_token",
    });
    return res.status(401).json({ success: false, message: "Refresh token required" });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "invalid_token",
    });
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const user = await UserModel.findById(decoded._id).select(
    "+authTokenVersion isBlockedUser isActiveUser",
  );
  if (!user) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "user_not_found",
    });
    return res.status(401).json({ success: false, message: "User not found" });
  }

  if (!isRefreshTokenVersionValid(decoded.tv, user)) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "revoked",
      userId: String(user._id),
    });
    return res.status(401).json({ success: false, message: "Refresh token revoked" });
  }

  if (user.isBlockedUser) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "blocked",
      userId: String(user._id),
    });
    return res.status(403).json({ success: false, message: BLOCKED_ACCOUNT_MESSAGE });
  }

  if (user.isActiveUser === false) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    logSecurityEvent("warn", "refresh_failed", {
      ...securityRequestFields(req),
      reason: "disabled",
      userId: String(user._id),
    });
    return res.status(403).json({ success: false, message: DISABLED_ACCOUNT_MESSAGE });
  }

  const data = await issueRotatedAuthSession(user, res, req);
  logSecurityEvent("info", "refresh_ok", {
    ...securityRequestFields(req),
    userId: String(user._id),
  });
  return res.status(200).json({ success: true, data });
};
