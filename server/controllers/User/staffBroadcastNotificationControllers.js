import { successRes } from "../../services/http/index.js";
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
  const result = await broadcastStaffNotificationToAllUsers({
    title: req.body?.title,
    message: req.body?.message,
    actorUserId: String(req.userId),
  });
  return successRes(res, result, 201);
};
