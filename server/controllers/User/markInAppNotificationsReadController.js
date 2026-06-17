import { markAllInAppNotificationsReadForUser } from "../../services/user/userInAppNotifications.js";
import { errorRes, successRes } from "../../services/http/index.js";

/** `PATCH /auth/me/in-app-notifications/read` */
export const markInAppNotificationsReadController = async (req, res) => {
const userId = req.userId;
    if (!userId) {
      return errorRes(res, 401, "Вы не авторизованы");
    }

    await markAllInAppNotificationsReadForUser(String(userId));

    return successRes(res, { message: "Уведомления прочитаны" });
};
