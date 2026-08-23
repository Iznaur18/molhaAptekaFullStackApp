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
      // Документ читаем внутри транзакции — на ретрае после WriteConflict
      // mongoose уже считает внешний документ чистым и save() ничего не пишет.
      const txnRaffle = await loadRaffleOrThrow(raffleId, session);
      if (txnRaffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
        throw new AppError(409, "Розыгрыш уже обработан");
      }

      const chargeResult = await chargeRaffleCreatePriceOnApproval({
        sellerId: String(txnRaffle.sellerId),
        raffle: txnRaffle.toObject(),
        session,
      });

      txnRaffle.status = RAFFLE_STATUS_ACTIVE;
      txnRaffle.approvedByUserId = staffId;
      txnRaffle.approvedAt = new Date();
      txnRaffle.moderationComment = "";
      await txnRaffle.save({ session });
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

  const approved = await loadRaffleOrThrow(raffleId);

  return {
    message: "Розыгрыш одобрен",
    raffle: toPublicRafflePayload(approved.toObject()),
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
    // См. approveRaffle: документ обязан читаться внутри транзакции, иначе
    // ретрай после WriteConflict молча теряет мутации.
    const txnRaffle = await loadRaffleOrThrow(raffleId, session);
    if (txnRaffle.status === RAFFLE_STATUS_REJECTED) {
      return;
    }
    if (txnRaffle.status !== RAFFLE_STATUS_PENDING_STAFF) {
      throw new AppError(409, "Розыгрыш уже обработан");
    }

    txnRaffle.status = RAFFLE_STATUS_REJECTED;
    txnRaffle.rejectedAt = new Date();
    txnRaffle.moderationComment = String(comment ?? "").trim();
    await txnRaffle.save({ session });
    await refundRaffleCreatePriceIfNeeded({
      sellerId: String(txnRaffle.sellerId),
      raffle: txnRaffle.toObject(),
      session,
    });
  });
  await clearRaffleParticipationFromProducts(raffle._id);

  const rejected = await loadRaffleOrThrow(raffleId);

  return {
    message: "Розыгрыш отклонён",
    raffle: toPublicRafflePayload(rejected.toObject(), { includePrivateFields: true }),
  };
}
