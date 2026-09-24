import { AccountDeviceLinkModel } from "../../models/index.js";
import { logSecurityFailure } from "./logSecurityEvent.js";

/**
 * Запоминает, что аккаунты держали в одном браузере. Фоновая запись: сбой не
 * должен ломать вход или переключение, но и не глотается молча — пишем в лог.
 *
 * @param {string} userId
 * @param {string[]} otherUserIds
 */
export function recordAccountDeviceLinks(userId, otherUserIds) {
  const self = String(userId).toLowerCase();
  const others = [
    ...new Set(otherUserIds.map((id) => String(id).toLowerCase())),
  ].filter((id) => id && id !== self);
  if (others.length === 0) {
    return;
  }

  const now = new Date();
  const operations = others.map((other) => {
    const [userIdLow, userIdHigh] = self < other ? [self, other] : [other, self];
    return {
      updateOne: {
        filter: { userIdLow, userIdHigh },
        update: {
          $setOnInsert: { firstSeenAt: now },
          $set: { lastSeenAt: now },
          $inc: { seenCount: 1 },
        },
        upsert: true,
      },
    };
  });

  AccountDeviceLinkModel.bulkWrite(operations, { ordered: false }).catch((error) => {
    logSecurityFailure("account_device_link", { userId: self }, error);
  });
}
