import { RAFFLE_CREATE_PRICE_POINTS } from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import { RaffleModel, UserModel } from "../../models/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../loyalty/loyaltyPointsReserve.js";
import {
  deductLoyaltyPoints,
  InsufficientLoyaltyPointsError,
  refundLoyaltyPoints,
} from "../loyalty/loyaltyPointsSpend.js";
import { getSellerLoyaltyPointsAvailable } from "../loyalty/loyaltyPointsSeller.js";
import {
  creditReferralCashbackFromSpend,
} from "../referral/creditReferralCashbackFromSpend.js";
import { reverseReferralCashbackForSource } from "../referral/reverseReferralCashbackForSource.js";
import { REFERRAL_SOURCE_KIND_RAFFLE_CREATE_UNLOCK } from "../../constants/referralConstants.js";

import {
  assertSellerCanCreateRaffle,
  getSellerActiveRaffle,
  toPublicRafflePayload,
} from "./raffleHelpers.js";

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export const hasRaffleCreateUnlock = (user) =>
  user?.raffleCreateUnlockAt instanceof Date;

const paidRaffleCreateUnlockFilter = () => ({
  raffleCreateUnlockAt: { $type: "date" },
});

/**
 * @param {string} sellerId
 */
export const getRaffleCreateAdvertisingStatus = async (sellerId) => {
  const access = await assertSellerCanCreateRaffle(sellerId);
  const [user, activeRaffle] = await Promise.all([
    UserModel.findById(sellerId)
      .select("userLoyaltyPoints userLoyaltyPointsReserved raffleCreateUnlockAt isUserDataConfirmed")
      .lean(),
    getSellerActiveRaffle(sellerId),
  ]);

  const loyaltyPointsBalance = getSellerLoyaltyPointsAvailable(user);
  const hasPaidUnlock = hasRaffleCreateUnlock(user);
  const hasOpenRaffle = Boolean(activeRaffle);
  const canOpenForm = hasPaidUnlock && !hasOpenRaffle && access.ok;
  const canPay =
    access.ok &&
    !hasOpenRaffle &&
    !hasPaidUnlock &&
    loyaltyPointsBalance >= RAFFLE_CREATE_PRICE_POINTS;

  return {
    pricePoints: RAFFLE_CREATE_PRICE_POINTS,
    hasPaidUnlock,
    hasOpenRaffle,
    canPay,
    canOpenForm,
    blockReason: access.ok ? null : access.message,
    loyaltyPointsBalance,
    raffle: activeRaffle
      ? toPublicRafflePayload(activeRaffle, { includePrivateFields: true })
      : null,
  };
};

/**
 * @param {{ sellerId: string }} input
 */
export const cancelRaffleCreateUnlock = async ({ sellerId }) => {
  const access = await assertSellerCanCreateRaffle(sellerId);
  if (!access.ok) {
    throw new AppError(403, access.message);
  }

  const activeRaffle = await getSellerActiveRaffle(sellerId);
  if (activeRaffle) {
    throw new AppError(409, "Сначала отзовите текущий розыгрыш с модерации");
  }

  const user = await UserModel.findById(sellerId)
    .select("raffleCreateUnlockAt userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  if (!hasRaffleCreateUnlock(user)) {
    return {
      message: "Создание розыгрыша уже отменено",
      loyaltyPointsBalance: getSellerLoyaltyPointsAvailable(user),
      hasPaidUnlock: false,
    };
  }

  const loyaltyPointsBalance = await runInTransaction(async (session) => {
    const updated = await UserModel.findOneAndUpdate(
      { _id: sellerId, ...paidRaffleCreateUnlockFilter() },
      { $unset: { raffleCreateUnlockAt: "" } },
      { returnDocument: "after", session },
    ).lean();

    if (!updated) {
      throw new AppError(409, "Оплата уже использована или отменена");
    }

    await releaseLoyaltyPointsReservation({
      userId: sellerId,
      amount: RAFFLE_CREATE_PRICE_POINTS,
      session,
    });

    const reloaded = await UserModel.findById(sellerId)
      .select("userLoyaltyPoints userLoyaltyPointsReserved")
      .session(session)
      .lean();

    return getSellerLoyaltyPointsAvailable(reloaded);
  });

  return {
    message: "Создание розыгрыша отменено. Баллы разблокированы.",
    loyaltyPointsBalance,
    hasPaidUnlock: false,
  };
};

export const unlockRaffleCreate = async ({ sellerId }) => {
  const access = await assertSellerCanCreateRaffle(sellerId);
  if (!access.ok) {
    throw new AppError(403, access.message);
  }

  const user = await UserModel.findById(sellerId)
    .select("raffleCreateUnlockAt userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  if (hasRaffleCreateUnlock(user)) {
    const loyaltyPointsBalance = getSellerLoyaltyPointsAvailable(user);
    return {
      message: "Доступ к созданию розыгрыша уже оплачен",
      loyaltyPointsBalance,
      hasPaidUnlock: true,
    };
  }

  try {
    const loyaltyPointsBalance = await runInTransaction(async (session) => {
      await reserveLoyaltyPoints({
        userId: sellerId,
        amount: RAFFLE_CREATE_PRICE_POINTS,
        session,
      });

      await UserModel.updateOne(
        { _id: sellerId },
        { $set: { raffleCreateUnlockAt: new Date() } },
        { session },
      );

      return getSellerLoyaltyPointsAvailable(
        await UserModel.findById(sellerId)
          .select("userLoyaltyPoints userLoyaltyPointsReserved")
          .session(session)
          .lean(),
      );
    });

    return {
      message: "Баллы зарезервированы. Заполните розыгрыш.",
      loyaltyPointsBalance,
      hasPaidUnlock: true,
    };
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        409,
        `Недостаточно баллов. Нужно: ${error.required}, у вас: ${error.available}`,
      );
    }
    throw error;
  }
};

/**
 * @param {{ sellerId: string; session?: import('mongoose').ClientSession }} input
 */
export const consumeRaffleCreateUnlock = async ({ sellerId, session }) => {
  const updated = await UserModel.findOneAndUpdate(
    {
      _id: sellerId,
      ...paidRaffleCreateUnlockFilter(),
    },
    { $unset: { raffleCreateUnlockAt: "" } },
    { returnDocument: "after", session: session ?? undefined },
  ).lean();

  if (!updated) {
    throw new AppError(402, "Сначала оплатите создание розыгрыша в разделе «Реклама»");
  }

  return updated;
};

/**
 * @param {{ sellerId: string; session?: import('mongoose').ClientSession }} input
 */
export const restoreRaffleCreateUnlock = async ({ sellerId, session }) => {
  await UserModel.updateOne(
    {
      _id: sellerId,
      raffleCreateUnlockAt: { $exists: false },
    },
    { $set: { raffleCreateUnlockAt: new Date() } },
    { session: session ?? undefined },
  );
};

export const releaseRaffleCreatePriceIfNeeded = async ({ sellerId, raffle, session }) => {
  const pricePoints = Math.ceil(Number(raffle.createPricePoints) || RAFFLE_CREATE_PRICE_POINTS);
  if (
    pricePoints <= 0 ||
    raffle.createPriceChargedAt != null ||
    raffle.createPriceRefundedAt != null
  ) {
    return;
  }

  await releaseLoyaltyPointsReservation({
    userId: sellerId,
    amount: pricePoints,
    session,
  });
};

/**
 * @param {{
 *   sellerId: string;
 *   raffle: Record<string, unknown>;
 *   session?: import('mongoose').ClientSession;
 * }} input
 */
export const chargeRaffleCreatePriceOnApproval = async ({ sellerId, raffle, session }) => {
  if (raffle.createPriceChargedAt != null || raffle.createPriceRefundedAt != null) {
    return { cashback: null };
  }

  const pricePoints = Math.ceil(Number(raffle.createPricePoints) || RAFFLE_CREATE_PRICE_POINTS);
  if (pricePoints <= 0) {
    return { cashback: null };
  }

  try {
    await chargeReservedLoyaltyPoints({
      userId: sellerId,
      amount: pricePoints,
      session,
    });
  } catch (error) {
    if (!(error instanceof InsufficientLoyaltyPointsError)) {
      throw error;
    }
    await deductLoyaltyPoints({
      userId: sellerId,
      amount: pricePoints,
      session,
    });
  }

  const cashback = await creditReferralCashbackFromSpend({
    spenderUserId: sellerId,
    pointsSpent: pricePoints,
    sourceKind: REFERRAL_SOURCE_KIND_RAFFLE_CREATE_UNLOCK,
    sourceId: String(raffle._id),
    session,
  });

  await RaffleModel.updateOne(
    { _id: raffle._id },
    { $set: { createPriceChargedAt: new Date() } },
    { session: session ?? undefined },
  );

  return { cashback };
};

/**
 * @param {{
 *   sellerId: string;
 *   raffle: Record<string, unknown>;
 *   session?: import('mongoose').ClientSession;
 * }} input
 */
export const refundRaffleCreatePriceIfNeeded = async ({ sellerId, raffle, session }) => {
  const pricePoints = Math.ceil(Number(raffle.createPricePoints) || 0);
  if (pricePoints <= 0 || raffle.createPriceRefundedAt != null) {
    return;
  }

  if (raffle.createPriceChargedAt != null) {
    await refundLoyaltyPoints({ userId: sellerId, amount: pricePoints, session });
    await reverseReferralCashbackForSource({
      sourceKind: REFERRAL_SOURCE_KIND_RAFFLE_CREATE_UNLOCK,
      sourceId: String(raffle._id),
      session,
    });
  } else {
    await releaseLoyaltyPointsReservation({ userId: sellerId, amount: pricePoints, session });
  }

  await RaffleModel.updateOne(
    { _id: raffle._id },
    { $set: { createPriceRefundedAt: new Date() } },
    { session: session ?? undefined },
  );
};
