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

export const refreshAuthController = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token required" });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const user = await UserModel.findById(decoded._id).select(
    "+authTokenVersion isBlockedUser isActiveUser",
  );
  if (!user) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: "User not found" });
  }

  if (!isRefreshTokenVersionValid(decoded.tv, user)) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: "Refresh token revoked" });
  }

  if (user.isBlockedUser) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    return res.status(403).json({ success: false, message: BLOCKED_ACCOUNT_MESSAGE });
  }

  if (user.isActiveUser === false) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
    return res.status(403).json({ success: false, message: DISABLED_ACCOUNT_MESSAGE });
  }

  const data = await issueRotatedAuthSession(user, res);
  return res.status(200).json({ success: true, data });
};
