import { UserModel } from "../../models/index.js";
import {
  clearAuthCookie,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
} from "../../utils/authCookie.js";
import { issueAuthSession } from "../../utils/issueAuthSession.js";
import { verifyRefreshToken } from "../../utils/authTokens.js";

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

    const data = issueAuthSession(user, res);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("refreshAuthController error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
