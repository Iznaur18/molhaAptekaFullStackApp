import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import {
  IN_APP_NOTIFICATION_KIND_AFFILIATE_PAYOUT,
  IN_APP_NOTIFICATION_MESSAGE_AFFILIATE_PAYOUT,
} from "../../constants/affiliateConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * In-app уведомление шареру после commit txn confirm.
 *
 * @param {{
 *   referrerUserId: string;
 *   amount: number;
 *   buyerUserId?: string | null;
 *   productId?: string | null;
 * }} params
 */
export async function notifyAffiliatePayoutCredited({
  referrerUserId,
  amount,
  buyerUserId = null,
  productId = null,
}) {
  if (!referrerUserId || amount <= 0) {
    return;
  }
  try {
    await createUserInAppNotification({
      userId: referrerUserId,
      kind: IN_APP_NOTIFICATION_KIND_AFFILIATE_PAYOUT,
      message: IN_APP_NOTIFICATION_MESSAGE_AFFILIATE_PAYOUT(amount),
      actorUserId: buyerUserId,
      productId,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "affiliate_payout_notify_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
