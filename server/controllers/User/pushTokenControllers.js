import { errorRes, successRes } from "../../services/http/index.js";
import {
  registerExpoPushTokenForUser,
  removeExpoPushTokenForUser,
} from "../../services/user/expoPushNotifications.js";

/** `PUT /auth/me/push-token` — регистрация Expo push token (mobile). */
export const registerPushTokenController = async (req, res) => {
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
};

/** `DELETE /auth/me/push-token` — снятие токена (logout / отзыв разрешений). */
export const removePushTokenController = async (req, res) => {
const token = req.body?.token;
    if (typeof token === "string" && token.trim()) {
      await removeExpoPushTokenForUser(req.userId, token);
    }
    return successRes(res, { removed: true });
};
