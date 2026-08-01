import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  IN_APP_NOTIFICATION_KIND_REFERRAL_CASHBACK,
  IN_APP_NOTIFICATION_MESSAGE_REFERRAL_CASHBACK,
  REFERRAL_LEDGER_ENTRY_CREDIT,
} from "../../constants/referralConstants.js";
import { creditLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { insertLedgerEntryIdempotent } from "../ledger/insertLedgerEntryIdempotent.js";
import { computeReferralCashbackAmount } from "./computeReferralCashbackAmount.js";

/**
 * Начисляет партнёрский кэшбэк рефереру сразу на баллы лояльности.
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

  const spenderLookup = UserModel.findById(spenderUserId).select("referredByUserId");
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

  // Идемпотентность по unique-индексу (referrerUserId, sourceKind, sourceId,
  // entryType=credit): второй гонщик получит created=false вместо 500.
  const { created, entry } = await insertLedgerEntryIdempotent({
    model: ReferralLedgerEntryModel,
    session,
    doc: {
      referrerUserId,
      referredUserId: spenderUserId,
      entryType: REFERRAL_LEDGER_ENTRY_CREDIT,
      sourceKind,
      sourceId: sourceIdNormalized,
      pointsSpent: Math.ceil(Number(pointsSpent) || 0),
      partnerAmount: amount,
    },
  });

  if (!created) {
    return { credited: false, amount: 0, duplicate: true };
  }

  await creditLoyaltyPoints({
    userId: referrerUserId,
    amount,
    session: session ?? undefined,
  });

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
