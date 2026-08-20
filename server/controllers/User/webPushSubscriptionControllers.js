import { errorRes, successRes } from "../../services/http/index.js";
import {
  getWebPushVapidPublicKey,
  isWebPushConfigured,
  registerWebPushSubscriptionForUser,
  removeWebPushSubscriptionForUser,
} from "../../services/user/webPushNotifications.js";

/** `GET /auth/me/web-push/vapid-public-key` — публичный VAPID для PushManager.subscribe. */
export const getWebPushVapidPublicKeyController = async (_req, res) => {
  if (!isWebPushConfigured()) {
    return errorRes(res, 503, "Web Push не настроен на сервере");
  }
  return successRes(res, { publicKey: getWebPushVapidPublicKey() });
};

/** `PUT /auth/me/web-push-subscription` — регистрация браузерной подписки. */
export const registerWebPushSubscriptionController = async (req, res) => {
  try {
    await registerWebPushSubscriptionForUser(req.userId, req.body);
  } catch (registerError) {
    return errorRes(
      res,
      400,
      registerError instanceof Error ? registerError.message : "Невалидная подписка",
    );
  }
  return successRes(res, { registered: true });
};

/** `DELETE /auth/me/web-push-subscription` — снятие подписки. */
export const removeWebPushSubscriptionController = async (req, res) => {
  const endpoint = req.body?.endpoint;
  if (typeof endpoint === "string" && endpoint.trim()) {
    await removeWebPushSubscriptionForUser(req.userId, endpoint);
  }
  return successRes(res, { removed: true });
};
