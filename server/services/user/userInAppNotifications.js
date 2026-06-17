import { UserInAppNotificationModel } from "../../models/index.js";
import {
  buildExpoPushDataPayload,
  sendExpoPushToUser,
} from "./expoPushNotifications.js";

const NOTIFICATION_LIST_LIMIT = 50;

/**
 * @param {{
 *   userId: import('mongoose').Types.ObjectId | string;
 *   kind: string;
 *   message: string;
 *   productId?: import('mongoose').Types.ObjectId | string | null;
 *   actorUserId?: import('mongoose').Types.ObjectId | string | null;
 * }} params
 */
export const createUserInAppNotification = async ({
  userId,
  kind,
  message,
  productId = null,
  actorUserId = null,
}) => {
  const doc = await UserInAppNotificationModel.create({
    userId,
    kind,
    message,
    productId: productId ?? null,
    actorUserId: actorUserId ?? null,
  });

  void sendExpoPushToUser(String(userId), {
    body: message,
    data: buildExpoPushDataPayload({
      kind,
      message,
      productId: productId ? String(productId) : null,
      actorUserId: actorUserId ? String(actorUserId) : null,
      notificationId: String(doc._id),
    }),
  }).catch((error) => {
    console.error("createUserInAppNotification push error:", error);
  });
};

/**
 * @param {string} userId
 */
export const getUnreadInAppNotificationsForUser = async (userId) => {
  const rows = await UserInAppNotificationModel.find({
    userId,
    readAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(NOTIFICATION_LIST_LIMIT)
    .lean();

  return rows.map((row) => ({
    _id: String(row._id),
    kind: row.kind,
    message: row.message,
    productId: row.productId ? String(row.productId) : null,
    actorUserId: row.actorUserId ? String(row.actorUserId) : null,
    createdAt: row.createdAt,
  }));
};

/**
 * @param {string} userId
 */
export const markAllInAppNotificationsReadForUser = async (userId) => {
  await UserInAppNotificationModel.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
};
