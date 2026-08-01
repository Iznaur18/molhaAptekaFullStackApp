import { UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { USER_DATA } from "../../constants/constants.js";
import { getOptionalViewerFromRequest } from "../../services/user/optionalViewerFromRequest.js";
import { sanitizeUserProfileForViewer } from "../../services/user/userProfileVisibility.js";
import { attachFollowFieldsToPublicProfile } from "../../services/user/userFollowHelpers.js";
import { attachUserCommerceStatsToUser } from "../../services/user/attachUserListCommerceStats.js";

/** Получение профиля другого пользователя по id. GET /user/:userId (публичный — без авторизации) */
export const userGetProfileController = async (req, res) => {
  const { userIdClient } = req.params; // id юзера из URL (валидация выполняется в middleware userIdParamValidation)

  const userIdServer = await UserModel.findById(userIdClient).select(USER_DATA).lean();

  if (!userIdServer) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const viewer = await getOptionalViewerFromRequest(req);

  if (userIdServer.isBlockedUser) {
    const isAdminViewer = viewer?.userRole === "admin" && !viewer.isBlockedUser;
    if (!isAdminViewer) {
      return errorRes(res, 404, "Пользователь не найден");
    }
  }

  const publicUser = sanitizeUserProfileForViewer(userIdServer, {
    viewer,
    viewerId: viewer?._id ?? null,
  });
  if (!publicUser) {
    return errorRes(res, 404, "Пользователь не найден");
  }

  const userWithFollow = await attachFollowFieldsToPublicProfile(publicUser, {
    viewerId: viewer?._id ?? null,
  });

  const userWithCommerce = await attachUserCommerceStatsToUser(userWithFollow);

  return successRes(res, { user: userWithCommerce });
};
