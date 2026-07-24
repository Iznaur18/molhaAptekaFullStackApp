import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  REFERRAL_LEDGER_ENTRY_CREDIT,
  REFERRAL_LEDGER_ENTRY_REVERSAL,
} from "../../constants/referralConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Откатывает партнёрский кэшбэк при refund баллов за ту же оплату.
 *
 * @param {{
 *   sourceKind: string;
 *   sourceId: string;
 *   session?: import('mongoose').ClientSession | null;
 * }} params
 */
export async function reverseReferralCashbackForSource({
  sourceKind,
  sourceId,
  session = null,
}) {
  const sourceIdNormalized = String(sourceId ?? "").trim();
  if (!sourceIdNormalized) {
    return { reversed: false };
  }

  const creditLookup = ReferralLedgerEntryModel.findOne({
    sourceKind,
    sourceId: sourceIdNormalized,
    entryType: REFERRAL_LEDGER_ENTRY_CREDIT,
  });
  if (session) {
    creditLookup.session(session);
  }
  const credit = await creditLookup.lean();
  if (!credit) {
    return { reversed: false };
  }

  const amount = Math.ceil(Number(credit.partnerAmount) || 0);
  if (amount <= 0) {
    return { reversed: false };
  }

  try {
    await ReferralLedgerEntryModel.create(
      [
        {
          referrerUserId: credit.referrerUserId,
          referredUserId: credit.referredUserId,
          entryType: REFERRAL_LEDGER_ENTRY_REVERSAL,
          sourceKind,
          sourceId: sourceIdNormalized,
          pointsSpent: Math.ceil(Number(credit.pointsSpent) || 0),
          partnerAmount: amount,
          relatedCreditEntryId: credit._id,
        },
      ],
      session ? { session } : undefined,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return { reversed: false, duplicate: true };
    }
    throw error;
  }

  const deducted = await UserModel.findOneAndUpdate(
    {
      _id: credit.referrerUserId,
      partnerBalance: { $gte: amount },
    },
    { $inc: { partnerBalance: -amount } },
    { session: session ?? undefined },
  );

  if (!deducted) {
    await UserModel.updateOne(
      { _id: credit.referrerUserId },
      { $set: { partnerBalance: 0 } },
      { session: session ?? undefined },
    );
    logServerEvent("warn", {
      event: "referral_cashback_reversal_clamped",
      referrerUserId: String(credit.referrerUserId),
      sourceKind,
      sourceId: sourceIdNormalized,
      amount,
    });
  }

  logServerEvent("info", {
    event: "referral_cashback_reversed",
    referrerUserId: String(credit.referrerUserId),
    sourceKind,
    sourceId: sourceIdNormalized,
    amount,
  });

  return { reversed: true, amount };
}
