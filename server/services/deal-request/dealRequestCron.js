import {
  DEAL_REQUEST_STATUS_COMPLETED,
  DEAL_REQUEST_STATUS_DONE,
  DEAL_REQUEST_STATUS_EXPIRED,
  DEAL_REQUEST_STATUS_PENDING,
} from "@molha/api-contract";

import { DealRequestModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

import { DEAL_REQUEST_NOTIFICATION_KIND } from "./dealRequest.js";

const DEAL_REQUEST_CRON_BATCH_SIZE = 200;

/**
 * @param {{ userId: unknown; message: string }} params
 */
const notifyQuietly = async ({ userId, message }) => {
  try {
    await createUserInAppNotification({
      userId: String(userId),
      kind: DEAL_REQUEST_NOTIFICATION_KIND,
      message,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "deal_request_cron_notify_failed",
      userId: String(userId),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Закрывает заявки, по которым одна из сторон замолчала.
 *
 * Без этого покупатель ждал бы ответа вечно, а исполнитель — подтверждения
 * от клиента, который просто закрыл сайт после оказанной услуги.
 *
 * Каждая заявка закрывается отдельным условным обновлением: если участник
 * успел ответить в ту же секунду, его ответ побеждает, а не таймер.
 *
 * @param {{ now?: Date }} [params]
 */
export async function processDealRequestCronTasks({ now = new Date() } = {}) {
  let expired = 0;
  let autoConfirmed = 0;

  const stale = await DealRequestModel.find({
    status: DEAL_REQUEST_STATUS_PENDING,
    expiresAt: { $lte: now },
  })
    .select("buyerId productNameAtRequest")
    .limit(DEAL_REQUEST_CRON_BATCH_SIZE)
    .lean();
  for (const row of stale) {
    const result = await DealRequestModel.updateOne(
      { _id: row._id, status: DEAL_REQUEST_STATUS_PENDING },
      { $set: { status: DEAL_REQUEST_STATUS_EXPIRED, isOpen: false } },
    );
    if (result.modifiedCount > 0) {
      expired += 1;
      await notifyQuietly({
        userId: row.buyerId,
        message: `Продавец не ответил на заявку «${row.productNameAtRequest}» — она закрыта`,
      });
    }
  }

  const unconfirmed = await DealRequestModel.find({
    status: DEAL_REQUEST_STATUS_DONE,
    autoConfirmAt: { $lte: now },
  })
    .select("sellerId productNameAtRequest")
    .limit(DEAL_REQUEST_CRON_BATCH_SIZE)
    .lean();
  for (const row of unconfirmed) {
    const result = await DealRequestModel.updateOne(
      { _id: row._id, status: DEAL_REQUEST_STATUS_DONE },
      {
        $set: {
          status: DEAL_REQUEST_STATUS_COMPLETED,
          isOpen: false,
          autoConfirmAt: null,
        },
      },
    );
    if (result.modifiedCount > 0) {
      autoConfirmed += 1;
      await notifyQuietly({
        userId: row.sellerId,
        message: `Заявка «${row.productNameAtRequest}» закрыта как выполненная`,
      });
    }
  }

  return { expired, autoConfirmed };
}
