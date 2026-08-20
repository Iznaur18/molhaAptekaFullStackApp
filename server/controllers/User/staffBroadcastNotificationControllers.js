import { errorRes, successRes } from "../../services/http/index.js";
import {
  broadcastStaffNotificationToAllUsers,
  countStaffBroadcastRecipients,
} from "../../services/user/staffBroadcastNotifications.js";

/** GET /staff/broadcast-notifications/recipients-count */
export const getStaffBroadcastRecipientsCountController = async (_req, res) => {
  const count = await countStaffBroadcastRecipients();
  return successRes(res, { count });
};

/** POST /staff/broadcast-notifications */
export const postStaffBroadcastNotificationController = async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  const message = String(req.body?.message ?? "").trim();
  if (!title || !message) {
    return errorRes(res, 400, "Укажите заголовок и текст");
  }

  const result = await broadcastStaffNotificationToAllUsers({
    title,
    message,
    actorUserId: String(req.userId),
  });

  return successRes(res, result, 201);
};
