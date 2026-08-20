import { STAFF_BROADCAST_NOTIFICATION_KIND } from "@molha/api-contract";

import { UserInAppNotificationModel, UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  buildExpoPushDataPayload,
  sendExpoPushToUser,
} from "./expoPushNotifications.js";
import {
  buildWebPushClickPath,
  sendWebPushToUser,
} from "./webPushNotifications.js";

const INSERT_CHUNK = 400;
const PUSH_CONCURRENCY = 25;

const recipientFilter = {
  isActiveUser: true,
  isBlockedUser: { $ne: true },
};

/**
 * @param {Array<T>} items
 * @param {number} concurrency
 * @param {(item: T) => Promise<void>} worker
 * @template T
 */
async function runPool(items, concurrency, worker) {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current]);
    }
  });
  await Promise.all(runners);
}

export async function countStaffBroadcastRecipients() {
  return UserModel.countDocuments(recipientFilter);
}

/**
 * @param {{
 *   title: string;
 *   message: string;
 *   actorUserId: string;
 * }} params
 */
export async function broadcastStaffNotificationToAllUsers({ title, message, actorUserId }) {
  const recipients = await UserModel.find(recipientFilter).select("_id").lean();
  const combinedMessage = `${title}\n${message}`;

  for (let offset = 0; offset < recipients.length; offset += INSERT_CHUNK) {
    const slice = recipients.slice(offset, offset + INSERT_CHUNK);
    await UserInAppNotificationModel.insertMany(
      slice.map((row) => ({
        userId: row._id,
        kind: STAFF_BROADCAST_NOTIFICATION_KIND,
        message: combinedMessage,
        actorUserId,
        productId: null,
      })),
      { ordered: false },
    );
  }

  void runPool(recipients, PUSH_CONCURRENCY, async (row) => {
    const userId = String(row._id);
    const pushData = buildExpoPushDataPayload({
      kind: STAFF_BROADCAST_NOTIFICATION_KIND,
      message: combinedMessage,
      productId: null,
      actorUserId,
      notificationId: null,
    });
    try {
      await sendExpoPushToUser(userId, {
        title,
        body: message,
        data: pushData,
      });
    } catch (error) {
      logServerEvent("error", {
        event: "staff_broadcast_expo_push",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    try {
      await sendWebPushToUser(userId, {
        title,
        body: message,
        url: buildWebPushClickPath({
          kind: STAFF_BROADCAST_NOTIFICATION_KIND,
          productId: null,
          actorUserId,
          notificationId: null,
        }),
        data: pushData,
      });
    } catch (error) {
      logServerEvent("error", {
        event: "staff_broadcast_web_push",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }).catch((error) => {
    logServerEvent("error", {
      event: "staff_broadcast_push_pool",
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return { sent: recipients.length };
}
