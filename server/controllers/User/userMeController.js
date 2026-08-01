import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { USER_DATA } from "../../constants/constants.js";
import { syncPremiumExpiryForUser } from "../../services/user/premiumAccess.js";
import { attachFollowFieldsToPublicProfile } from "../../services/user/userFollowHelpers.js";
import { attachUserCommerceStatsToUser } from "../../services/user/attachUserListCommerceStats.js";
import { getUnreadInAppNotificationsForUser } from "../../services/user/userInAppNotifications.js";

/** Получение данных текущего пользователя. GET /auth/me (JWT в httpOnly cookie) */
export const userMeController = async (req, res) => {
  const userIdClient = req.userId;

  if (!userIdClient) {
    return successRes(res, { user: null, inAppNotifications: [] });
  }

  // 2. Ищем пользователя в БД по id
  await syncPremiumExpiryForUser(userIdClient);

  const userIdServer = await UserModel.findById(userIdClient)
    .select(`${USER_DATA} userLoyaltyPointsReserved`)
    .lean();

  if (!userIdServer) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const userWithFollow = await attachFollowFieldsToPublicProfile(userIdServer, {
    viewerId: userIdClient,
  });

  const userWithCommerce = await attachUserCommerceStatsToUser(userWithFollow);

  const inAppNotifications = await getUnreadInAppNotificationsForUser(userIdClient);

  return successRes(res, { user: userWithCommerce, inAppNotifications });
};
