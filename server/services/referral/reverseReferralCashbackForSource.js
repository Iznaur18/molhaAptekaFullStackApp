import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  REFERRAL_LEDGER_ENTRY_CREDIT,
  REFERRAL_LEDGER_ENTRY_REVERSAL,
} from "../../constants/referralConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

export class InsufficientPartnerBalanceForReversalError extends Error {
  /**
   * @param {number} required
   * @param {number} available
   */
  constructor(required, available) {
    super(
      "Нельзя откатить партнёрский кэшбэк: баланс уже конвертирован или недостаточен",
    );
    this.name = "InsufficientPartnerBalanceForReversalError";
    this.required = required;
    this.available = available;
  }
}

/**
 * Откатывает партнёрский кэшбэк при refund баллов за ту же оплату.
 * Без clamp-to-0: если баланса нет (уже convert) — ошибка, ledger reversal не пишем.
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

  const existingReversalLookup = ReferralLedgerEntryModel.findOne({
    sourceKind,
    sourceId: sourceIdNormalized,
    entryType: REFERRAL_LEDGER_ENTRY_REVERSAL,
  }).select("_id");
  if (session) {
    existingReversalLookup.session(session);
  }
  const existingReversal = await existingReversalLookup.lean();
  if (existingReversal) {
    return { reversed: false, duplicate: true };
  }

  const deducted = await UserModel.findOneAndUpdate(
    {
      _id: credit.referrerUserId,
      partnerBalance: { $gte: amount },
    },
    { $inc: { partnerBalance: -amount } },
    { session: session ?? undefined, returnDocument: "after" },
  );

  if (!deducted) {
    const userLookup = UserModel.findById(credit.referrerUserId).select(
      "partnerBalance",
    );
    if (session) {
      userLookup.session(session);
    }
    const user = await userLookup.lean();
    const available = Number(user?.partnerBalance) || 0;
    throw new InsufficientPartnerBalanceForReversalError(amount, available);
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
      await UserModel.updateOne(
        { _id: credit.referrerUserId },
        { $inc: { partnerBalance: amount } },
        { session: session ?? undefined },
      );
      return { reversed: false, duplicate: true };
    }
    await UserModel.updateOne(
      { _id: credit.referrerUserId },
      { $inc: { partnerBalance: amount } },
      { session: session ?? undefined },
    );
    throw error;
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
