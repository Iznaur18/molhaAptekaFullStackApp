import jwt from "jsonwebtoken";

import { UserModel } from "../models/index.js";
import { getAuthTokenFromRequest } from "./authCookie.js";

/**
 * @param {import('express').Request} req
 * @returns {Promise<{ _id: string; userRole: string; isBlockedUser?: boolean; isPremiumUser?: boolean } | null>}
 */
export async function getOptionalViewerFromRequest(req) {
  const token = getAuthTokenFromRequest(req);
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const viewer = await UserModel.findById(decoded._id)
      .select("userRole isBlockedUser isPremiumUser")
      .lean();
    if (!viewer) return null;
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
