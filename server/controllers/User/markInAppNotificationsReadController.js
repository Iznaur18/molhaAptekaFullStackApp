import { AppError } from "../../errors/AppError.js";
import { successRes } from "../../services/http/index.js";
import { markAllInAppNotificationsReadForUser } from "../../services/user/userInAppNotifications.js";

/** `PATCH /auth/me/in-app-notifications/read` */
export const markInAppNotificationsReadController = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError(401, "Вы не авторизованы");
  }

  await markAllInAppNotificationsReadForUser(String(userId));
  return successRes(res, { message: "Уведомления прочитаны" });
};
