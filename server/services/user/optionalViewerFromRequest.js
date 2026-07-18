import { UserModel } from "../../models/index.js";
import { getAuthTokenFromRequest } from "../../utils/authCookie.js";
import { verifyAccessToken } from "../auth/authTokens.js";
import { isRefreshTokenVersionValid } from "../auth/userAuthTokenVersion.js";

/**
 * @param {import('express').Request} req
 * @returns {Promise<{ _id: string; userRole: string; isBlockedUser?: boolean; isPremiumUser?: boolean } | null>}
 */
export async function getOptionalViewerFromRequest(req) {
  const token = getAuthTokenFromRequest(req);
  if (!token || !(process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET)) {
    return null;
  }

  try {
    const decoded = verifyAccessToken(token);
    const viewer = await UserModel.findById(decoded._id)
      .select("+authTokenVersion userRole isBlockedUser isPremiumUser isActiveUser")
      .lean();
    if (!viewer) return null;
    if (!isRefreshTokenVersionValid(decoded.tv, viewer)) return null;
    if (viewer.isBlockedUser || viewer.isActiveUser === false) return null;
    return {
      _id: String(viewer._id),
      userRole: viewer.userRole,
      isBlockedUser: Boolean(viewer.isBlockedUser),
      isPremiumUser: Boolean(viewer.isPremiumUser),
    };
  } catch {
    return null;
  }
}
