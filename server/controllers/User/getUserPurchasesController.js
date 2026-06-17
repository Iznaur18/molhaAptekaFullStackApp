import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { getOptionalViewerFromRequest } from "../../services/user/optionalViewerFromRequest.js";
import { sanitizeUserProfileForViewer } from "../../services/user/userProfileVisibility.js";
import { getUserRecentUniquePurchases } from "../../services/user/userRecentPurchases.js";
import {
  canViewerSeeOtherUserPurchases,
  OTHER_USER_PURCHASES_PREMIUM_ONLY_MESSAGE,
} from "../../services/user/userPurchasesVisibility.js";

/** `GET /user/:userIdClient/purchases` — последние уникальные покупки (JWT). */
export const getUserPurchasesController = async (req, res) => {
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
};
