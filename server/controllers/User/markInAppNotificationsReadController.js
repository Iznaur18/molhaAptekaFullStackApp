import { markAllInAppNotificationsReadForUser } from "../../utils/userInAppNotifications.js";
import { errorRes, successRes } from "../../utils/index.js";

/** `PATCH /auth/me/in-app-notifications/read` */
export const markInAppNotificationsReadController = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return errorRes(res, 401, "Вы не авторизованы");
    }

    await markAllInAppNotificationsReadForUser(String(userId));

    return successRes(res, { message: "Уведомления прочитаны" });
  } catch (error) {
    console.error("markInAppNotificationsReadController error:", error);
    return errorRes(res, 500, "Ошибка при обновлении уведомлений");
  }
};
