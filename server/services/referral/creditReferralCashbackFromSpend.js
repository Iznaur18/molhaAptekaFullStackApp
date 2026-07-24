import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  IN_APP_NOTIFICATION_KIND_REFERRAL_CASHBACK,
  IN_APP_NOTIFICATION_MESSAGE_REFERRAL_CASHBACK,
  REFERRAL_LEDGER_ENTRY_CREDIT,
} from "../../constants/referralConstants.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { computeReferralCashbackAmount } from "./computeReferralCashbackAmount.js";

/**
 * Начисляет партнёрский кэшбэк рефереру после фактического списания баллов у реферала.
 * Идемпотентно по (sourceKind, sourceId, entryType=credit).
 *
 * @param {{
 *   spenderUserId: string;
 *   pointsSpent: number;
 *   sourceKind: string;
 *   sourceId: string;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export async function creditReferralCashbackFromSpend({
  spenderUserId,
  pointsSpent,
  sourceKind,
  sourceId,
  session = null,
}) {
  const amount = computeReferralCashbackAmount(pointsSpent);
  if (amount <= 0) {
    return { credited: false, amount: 0 };
  }

  const sourceIdNormalized = String(sourceId ?? "").trim();
  if (!sourceIdNormalized) {
    return { credited: false, amount: 0 };
  }

  const spenderLookup = UserModel.findById(spenderUserId).select(
    "referredByUserId",
  );
  if (session) {
    spenderLookup.session(session);
  }
  const spender = await spenderLookup.lean();
  const referrerUserId = spender?.referredByUserId
    ? String(spender.referredByUserId)
    : "";
  if (!referrerUserId) {
    return { credited: false, amount: 0 };
  }

  try {
    const [entry] = await ReferralLedgerEntryModel.create(
      [
        {
          referrerUserId,
          referredUserId: spenderUserId,
          entryType: REFERRAL_LEDGER_ENTRY_CREDIT,
          sourceKind,
          sourceId: sourceIdNormalized,
          pointsSpent: Math.ceil(Number(pointsSpent) || 0),
          partnerAmount: amount,
        },
      ],
      session ? { session } : undefined,
    );

    await UserModel.updateOne(
      { _id: referrerUserId },
      { $inc: { partnerBalance: amount } },
      { session: session ?? undefined },
    );

    if (!session) {
      void createUserInAppNotification({
        userId: referrerUserId,
        kind: IN_APP_NOTIFICATION_KIND_REFERRAL_CASHBACK,
        message: IN_APP_NOTIFICATION_MESSAGE_REFERRAL_CASHBACK(amount),
        actorUserId: spenderUserId,
      }).catch((error) => {
        logServerEvent("error", {
          event: "referral_cashback_notify_failed",
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    logServerEvent("info", {
      event: "referral_cashback_credited",
      referrerUserId,
      referredUserId: String(spenderUserId),
      sourceKind,
      sourceId: sourceIdNormalized,
      amount,
      ledgerEntryId: String(entry._id),
    });

    return {
      credited: true,
      amount,
      ledgerEntryId: String(entry._id),
      referrerUserId,
      deferNotification: Boolean(session),
    };
  } catch (error) {
    if (error?.code === 11000) {
      return { credited: false, amount: 0, duplicate: true };
    }
    throw error;
  }
}

/**
 * In-app уведомление после commit транзакции (если credit был внутри session).
 *
 * @param {{
 *   referrerUserId: string;
 *   amount: number;
 *   spenderUserId: string;
 * }} params
 */
export async function notifyReferralCashbackCredited({
  referrerUserId,
  amount,
  spenderUserId,
}) {
  if (!referrerUserId || amount <= 0) {
    return;
  }
  try {
    await createUserInAppNotification({
      userId: referrerUserId,
      kind: IN_APP_NOTIFICATION_KIND_REFERRAL_CASHBACK,
      message: IN_APP_NOTIFICATION_MESSAGE_REFERRAL_CASHBACK(amount),
      actorUserId: spenderUserId,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "referral_cashback_notify_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
