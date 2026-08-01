import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  REFERRAL_LEDGER_ENTRY_CREDIT,
  REFERRAL_LEDGER_ENTRY_REVERSAL,
} from "../../constants/referralConstants.js";
import {
  creditLoyaltyPoints,
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import { getSellerLoyaltyPointsAvailable } from "../loyalty/loyaltyPointsSeller.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

export class InsufficientPartnerBalanceForReversalError extends Error {
  /**
   * @param {number} required
   * @param {number} available
   */
  constructor(required, available) {
    super(
      "Нельзя откатить партнёрский кэшбэк: недостаточно свободных баллов лояльности",
    );
    this.name = "InsufficientPartnerBalanceForReversalError";
    this.required = required;
    this.available = available;
  }
}

/**
 * Откатывает партнёрский кэшбэк с баланса баллов при refund той же оплаты.
 * Без clamp-to-0: если свободных баллов нет — ошибка, ledger reversal не пишем.
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

  try {
    await deductLoyaltyPoints({
      userId: String(credit.referrerUserId),
      amount,
      session: session ?? undefined,
    });
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new InsufficientPartnerBalanceForReversalError(
        error.required,
        error.available,
      );
    }
    const userLookup = UserModel.findById(credit.referrerUserId).select(
      "userLoyaltyPoints userLoyaltyPointsReserved",
    );
    if (session) {
      userLookup.session(session);
    }
    const user = await userLookup.lean();
    const available = getSellerLoyaltyPointsAvailable(user);
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
      await creditLoyaltyPoints({
        userId: String(credit.referrerUserId),
        amount,
        session: session ?? undefined,
      });
      return { reversed: false, duplicate: true };
    }
    await creditLoyaltyPoints({
      userId: String(credit.referrerUserId),
      amount,
      session: session ?? undefined,
    });
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
