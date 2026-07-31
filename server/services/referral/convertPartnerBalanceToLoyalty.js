import { ReferralLedgerEntryModel, UserModel } from "../../models/index.js";
import {
  REFERRAL_INSUFFICIENT_BALANCE_MESSAGE,
  REFERRAL_LEDGER_ENTRY_CONVERSION,
  REFERRAL_SOURCE_KIND_CONVERSION,
} from "../../constants/referralConstants.js";
import { AppError } from "../../errors/AppError.js";
import { creditLoyaltyPoints } from "../loyalty/loyaltyPointsSpend.js";
import {
  MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE,
  requireMoneyIdempotencyKey,
} from "../loyalty/runMoneyIdempotentMutation.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

/**
 * @param {string} userId
 * @param {string} sourceId
 * @param {number} fallbackAmount
 */
async function loadExistingConversionResult(userId, sourceId, fallbackAmount) {
  const [existing, user] = await Promise.all([
    ReferralLedgerEntryModel.findOne({
      sourceKind: REFERRAL_SOURCE_KIND_CONVERSION,
      sourceId,
      entryType: REFERRAL_LEDGER_ENTRY_CONVERSION,
    })
      .select("partnerAmount")
      .lean(),
    UserModel.findById(userId).select("partnerBalance userLoyaltyPoints").lean(),
  ]);

  if (!existing || !user) {
    return null;
  }

  return {
    converted: Math.ceil(Number(existing.partnerAmount) || fallbackAmount),
    partnerBalance: Number(user.partnerBalance) || 0,
    loyaltyPointsBalance: Number(user.userLoyaltyPoints) || 0,
    duplicate: true,
  };
}

/**
 * Конвертирует партнёрский баланс в баллы лояльности 1:1.
 *
 * @param {{
 *   userId: string;
 *   amount: number;
 *   idempotencyKey: string;
 * }} params
 */
export async function convertPartnerBalanceToLoyalty({
  userId,
  amount,
  idempotencyKey,
}) {
  const normalizedAmount = Math.ceil(Number(amount));
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Сумма конвертации должна быть больше 0");
  }

  let key;
  try {
    key = requireMoneyIdempotencyKey(idempotencyKey);
  } catch (error) {
    if (error instanceof AppError) {
      throw new Error(MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE);
    }
    throw error;
  }
  const sourceId = `conversion:${userId}:${key}`;

  const existing = await loadExistingConversionResult(
    userId,
    sourceId,
    normalizedAmount,
  );
  if (existing) {
    return existing;
  }

  try {
    return await runInTransaction(async (session) => {
      const updated = await UserModel.findOneAndUpdate(
        { _id: userId, partnerBalance: { $gte: normalizedAmount } },
        { $inc: { partnerBalance: -normalizedAmount } },
        {
          returnDocument: "after",
          ...(session ? { session } : {}),
        },
      ).lean();

      if (!updated) {
        const userLookup = UserModel.findById(userId).select("partnerBalance");
        if (session) {
          userLookup.session(session);
        }
        const user = await userLookup.lean();
        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }
        const err = new Error(REFERRAL_INSUFFICIENT_BALANCE_MESSAGE);
        err.name = "InsufficientPartnerBalanceError";
        err.available = Number(user.partnerBalance) || 0;
        throw err;
      }

      const loyaltyPointsBalance = await creditLoyaltyPoints({
        userId,
        amount: normalizedAmount,
        session,
      });

      await ReferralLedgerEntryModel.create(
        [
          {
            referrerUserId: userId,
            referredUserId: userId,
            entryType: REFERRAL_LEDGER_ENTRY_CONVERSION,
            sourceKind: REFERRAL_SOURCE_KIND_CONVERSION,
            sourceId,
            pointsSpent: 0,
            partnerAmount: normalizedAmount,
          },
        ],
        session ? { session } : undefined,
      );

      return {
        converted: normalizedAmount,
        partnerBalance: Number(updated.partnerBalance) || 0,
        loyaltyPointsBalance,
      };
    });
  } catch (error) {
    if (error?.code === 11000) {
      const dup = await loadExistingConversionResult(
        userId,
        sourceId,
        normalizedAmount,
      );
      if (dup) {
        return dup;
      }
    }
    throw error;
  }
}
