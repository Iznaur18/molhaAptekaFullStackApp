import { USER_DATA } from "../../constants/constants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { attachUserCommerceStatsToUser } from "./attachUserListCommerceStats.js";
import { getOptionalViewerFromRequest } from "./optionalViewerFromRequest.js";
import { attachBlockFieldsToPublicProfile } from "./userBlockHelpers.js";
import { attachFollowFieldsToPublicProfile } from "./userFollowHelpers.js";
import { sanitizeUserProfileForViewer } from "./userProfileVisibility.js";
import { attachWishlistCountToUser } from "./userWishlistCount.js";

/**
 * @param {{
 *   targetUserId: string;
 *   req: import('express').Request;
 * }} args
 */
export async function getPublicUserProfile({ targetUserId, req }) {
  const user = await UserModel.findById(targetUserId).select(USER_DATA).lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const viewer = await getOptionalViewerFromRequest(req);

  if (user.isBlockedUser) {
    const isAdminViewer = viewer?.userRole === "admin" && !viewer.isBlockedUser;
    if (!isAdminViewer) {
      throw new AppError(404, "Пользователь не найден");
    }
  }

  const publicUser = sanitizeUserProfileForViewer(user, {
    viewer,
    viewerId: viewer?._id ?? null,
  });
  if (!publicUser) {
    throw new AppError(404, "Пользователь не найден");
  }

  const userWithFollow = await attachFollowFieldsToPublicProfile(publicUser, {
    viewerId: viewer?._id ?? null,
  });

  const userWithBlock = await attachBlockFieldsToPublicProfile(userWithFollow, {
    viewerId: viewer?._id ?? null,
  });

  const userWithCommerce = await attachUserCommerceStatsToUser(userWithBlock);
  const userWithWishlistCount = await attachWishlistCountToUser(userWithCommerce);

  return { user: userWithWishlistCount };
}
