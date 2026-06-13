import { UserModel } from "../../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { issueAuthSession } from "../../utils/issueAuthSession.js";
import { verifyRefreshToken } from "../../utils/authTokens.js";
import {
  BLOCKED_ACCOUNT_MESSAGE,
  DISABLED_ACCOUNT_MESSAGE,
} from "../../middlewares/checkAuthMW.js";

export const refreshAuthController = async (req, res) => {
  try {
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

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      clearAuthCookie(res);
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: "User not found" });
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

    const data = issueAuthSession(user, res);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("refreshAuthController error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
