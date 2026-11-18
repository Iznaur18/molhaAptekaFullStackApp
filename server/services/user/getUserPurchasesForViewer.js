import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { getOptionalViewerFromRequest } from "./optionalViewerFromRequest.js";
import {
  canViewerSeeOtherUserPurchases,
  OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE,
} from "./userPurchasesVisibility.js";
import { sanitizeUserProfileForViewer } from "./userProfileVisibility.js";
import { getUserRecentUniquePurchases } from "./userRecentPurchases.js";

/**
 * @param {{
 *   viewerUserId: unknown;
 *   targetUserId: string;
 *   req: import('express').Request;
 * }} args
 */
export async function getUserPurchasesForViewer({
  viewerUserId,
  targetUserId,
  req,
}) {
  if (!viewerUserId) {
    throw new AppError(401, "Требуется авторизация");
  }

  const targetUser = await UserModel.findById(targetUserId).lean();
  if (!targetUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const viewer = await getOptionalViewerFromRequest(req);
  const publicUser = sanitizeUserProfileForViewer(targetUser, {
    viewer,
    viewerId: viewerUserId,
  });
  if (!publicUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const viewerId = String(viewerUserId);
  if (viewerId !== String(targetUserId)) {
    const viewerRecord = await UserModel.findById(viewerId)
      .select("userRole isBlockedUser isPremiumUser")
      .lean();
    if (!canViewerSeeOtherUserPurchases(viewerRecord)) {
      throw new AppError(403, OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE);
    }
  }

  const items = await getUserRecentUniquePurchases(targetUserId);
  return { items };
}
