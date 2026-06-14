import { errorRes, successRes } from "../../utils/index.js";
import {
  registerExpoPushTokenForUser,
  removeExpoPushTokenForUser,
} from "../../utils/expoPushNotifications.js";

/** `PUT /auth/me/push-token` — регистрация Expo push token (mobile). */
export const registerPushTokenController = async (req, res) => {
  try {
    const { token, platform } = req.body ?? {};

    try {
      await registerExpoPushTokenForUser(req.userId, token, platform);
    } catch (registerError) {
      return errorRes(
        res,
        400,
        registerError instanceof Error ? registerError.message : "Невалидный push token",
      );
    }

    return successRes(res, { registered: true });
  } catch (error) {
    console.error("registerPushTokenController error:", error);
    return errorRes(res, 500, "Не удалось сохранить push token");
  }
};

/** `DELETE /auth/me/push-token` — снятие токена (logout / отзыв разрешений). */
export const removePushTokenController = async (req, res) => {
  try {
    const token = req.body?.token;
    if (typeof token === "string" && token.trim()) {
      await removeExpoPushTokenForUser(req.userId, token);
    }
    return successRes(res, { removed: true });
  } catch (error) {
    console.error("removePushTokenController error:", error);
    return errorRes(res, 500, "Не удалось удалить push token");
  }
};
