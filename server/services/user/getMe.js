import { USER_DATA } from "../../constants/constants.js";
import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { attachUserCommerceStatsToUser } from "./attachUserListCommerceStats.js";
import { syncPremiumExpiryForUser } from "./premiumAccess.js";
import { attachFollowFieldsToPublicProfile } from "./userFollowHelpers.js";
import { getUnreadInAppNotificationsForUser } from "./userInAppNotifications.js";
import { attachWishlistCountToUser } from "./userWishlistCount.js";

/**
 * @param {{ userId: unknown }} args
 */
export async function getMe({ userId }) {
  if (!userId) {
    return { user: null, inAppNotifications: [] };
  }

  await syncPremiumExpiryForUser(userId);

  const user = await UserModel.findById(userId)
    .select(`${USER_DATA} userLoyaltyPointsReserved`)
    .lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const userWithFollow = await attachFollowFieldsToPublicProfile(user, {
    viewerId: userId,
  });

  const userWithCommerce = await attachWishlistCountToUser(
    await attachUserCommerceStatsToUser(userWithFollow),
  );

  const inAppNotifications = await getUnreadInAppNotificationsForUser(userId);

  return { user: userWithCommerce, inAppNotifications };
}
