import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";
import { getOptionalViewerFromRequest } from "../../utils/optionalViewerFromRequest.js";
import { sanitizeUserProfileForViewer } from "../../utils/userProfileVisibility.js";
import { getUserRecentUniquePurchases } from "../../utils/userRecentPurchases.js";
import {
  canViewerSeeOtherUserPurchases,
  OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE,
} from "../../utils/userPurchasesVisibility.js";

/** `GET /user/:userIdClient/purchases` — последние уникальные покупки (JWT). */
export const getUserPurchasesController = async (req, res) => {
  try {
    if (!req.userId) {
      return errorRes(res, 401, "Требуется авторизация");
    }

    const targetUserId = req.params.userIdClient;
    const targetUser = await UserModel.findById(targetUserId).lean();

    if (!targetUser) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const viewer = await getOptionalViewerFromRequest(req);
    const publicUser = sanitizeUserProfileForViewer(targetUser, {
      viewer,
      viewerId: req.userId,
    });

    if (!publicUser) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const viewerId = String(req.userId);
    if (viewerId !== String(targetUserId)) {
      const viewerRecord = await UserModel.findById(viewerId)
        .select("userRole isBlockedUser isPremiumUser")
        .lean();
      if (!canViewerSeeOtherUserPurchases(viewerRecord)) {
        return errorRes(res, 403, OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE);
      }
    }

    const items = await getUserRecentUniquePurchases(targetUserId);

    return successRes(res, { items });
  } catch (error) {
    console.error("getUserPurchasesController error:", error);
    return errorRes(res, 500, "Ошибка при получении покупок пользователя");
  }
};
