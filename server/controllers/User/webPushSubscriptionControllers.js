import { successRes } from "../../services/http/index.js";
import {
  registerWebPushSubscriptionForUser,
  removeWebPushSubscriptionForUser,
  requireWebPushVapidPublicKey,
} from "../../services/user/webPushNotifications.js";

/** `GET /auth/me/web-push/vapid-public-key` */
export const getWebPushVapidPublicKeyController = async (_req, res) => {
  const data = requireWebPushVapidPublicKey();
  return successRes(res, data);
};

/** `PUT /auth/me/web-push-subscription` */
export const registerWebPushSubscriptionController = async (req, res) => {
  await registerWebPushSubscriptionForUser(req.userId, req.body);
  return successRes(res, { registered: true });
};

/** `DELETE /auth/me/web-push-subscription` */
export const removeWebPushSubscriptionController = async (req, res) => {
  const endpoint = req.body?.endpoint;
  if (typeof endpoint === "string" && endpoint.trim()) {
    await removeWebPushSubscriptionForUser(req.userId, endpoint);
  }
  return successRes(res, { removed: true });
};
