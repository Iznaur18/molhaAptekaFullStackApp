import {
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_STATUS_REJECTED,
} from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import { InsufficientLoyaltyPointsError } from "../loyalty/loyaltyPointsSpend.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import {
  assertSiteActiveRafflesWithinLimit,
  clearRaffleParticipationFromProducts,
  toPublicRafflePayload,
} from "./raffleHelpers.js";
import {
  chargeRaffleCreatePriceOnApproval,
  refundRaffleCreatePriceIfNeeded,
} from "./raffleCreateAccess.js";
import { notifyReferralCashbackCredited } from "../referral/creditReferralCashbackFromSpend.js";
import { loadRaffleOrThrow } from "./raffleServiceHelpers.js";

/**
 * @param {{
 *   staffId: string;
 *   raffleId: string;
 * }} input
 */
export async function approveRaffle({ staffId, raffleId }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Розыгрыш уже обработан");
  }

  const globalCheck = await assertSiteActiveRafflesWithinLimit(raffle._id);
  if (!globalCheck.ok) {
    throw new AppError(409, globalCheck.message);
  }

  try {
    const { cashback } = await runInTransaction(async (session) => {
      const chargeResult = await chargeRaffleCreatePriceOnApproval({
        sellerId: String(raffle.sellerId),
        raffle: raffle.toObject(),
        session,
      });

      raffle.status = RAFFLE_STATUS_ACTIVE;
      raffle.approvedByUserId = staffId;
      raffle.approvedAt = new Date();
      raffle.moderationComment = "";
      await raffle.save({ session });
      return chargeResult;
    });

    if (cashback?.deferNotification) {
      await notifyReferralCashbackCredited({
        referrerUserId: cashback.referrerUserId,
        amount: cashback.amount,
        spenderUserId: String(raffle.sellerId),
      });
    }
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов у продавца. Нужно: ${error.required}, доступно: ${error.available}`,
      );
    }
    throw error;
  }

  return {
    message: "Розыгрыш одобрен",
    raffle: toPublicRafflePayload(raffle.toObject()),
  };
}

/**
 * @param {{
 *   raffleId: string;
 *   comment?: string;
 * }} input
 */
export async function rejectRaffle({ raffleId, comment }) {
  const raffle = await loadRaffleOrThrow(raffleId);

  if (raffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
    throw new AppError(409, "Розыгрыш уже обработан");
  }

  await runInTransaction(async (session) => {
    raffle.status = RAFFLE_STATUS_REJECTED;
    raffle.rejectedAt = new Date();
    raffle.moderationComment = String(comment ?? "").trim();
    await raffle.save({ session });
    await refundRaffleCreatePriceIfNeeded({
      sellerId: String(raffle.sellerId),
      raffle: raffle.toObject(),
      session,
    });
  });
  await clearRaffleParticipationFromProducts(raffle._id);

  return {
    message: "Розыгрыш отклонён",
    raffle: toPublicRafflePayload(raffle.toObject(), { includePrivateFields: true }),
  };
}
