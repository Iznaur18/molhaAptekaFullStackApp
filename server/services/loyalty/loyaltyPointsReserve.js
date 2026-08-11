import { UserModel } from "../../models/index.js";

import { InsufficientLoyaltyPointsError } from "./loyaltyPointsSpend.js";
import { withMongoSession } from "../../utils/mongoTransaction.js";
import { getSellerLoyaltyPointsAvailable } from "./loyaltyPointsSeller.js";
import { logMoneyEvent, logMoneyFailure } from "./logMoneyEvent.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * @param {string} userId
 * @param {number} amount
 * @param {import('mongoose').ClientSession | null} [session]
 * @returns {Promise<number>}
 */
export const reserveLoyaltyPoints = async ({ userId, amount, session = null }) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    return 0;
  }

  try {
    const updated = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        $expr: {
          $gte: [
            {
              $subtract: [
                "$userLoyaltyPoints",
                { $ifNull: ["$userLoyaltyPointsReserved", 0] },
              ],
            },
            normalizedAmount,
          ],
        },
      },
      { $inc: { userLoyaltyPointsReserved: normalizedAmount } },
      withMongoSession({ returnDocument: "after" }, session),
    ).lean();

    if (!updated) {
      const user = await UserModel.findById(userId)
        .select("userLoyaltyPoints userLoyaltyPointsReserved")
        .lean();
      const available = getSellerLoyaltyPointsAvailable(user);
      throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }

    const balance = Number(updated.userLoyaltyPoints) || 0;
    logMoneyEvent("info", "loyalty_reserve", {
      userId: String(userId),
      amount: normalizedAmount,
      currency: "LP",
      balanceAfter: balance,
    });
    return balance;
  } catch (error) {
    logMoneyFailure(
      "loyalty_reserve",
      { userId: String(userId), amount: normalizedAmount, currency: "LP" },
      error,
    );
    throw error;
  }
};

/**
 * @param {string} userId
 * @param {number} amount
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const releaseLoyaltyPointsReservation = async ({
  userId,
  amount,
  session = null,
}) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    throw new Error("Сумма снятия резерва должна быть больше 0");
  }

  try {
    const result = await UserModel.updateOne(
      {
        _id: userId,
        userLoyaltyPointsReserved: { $gte: normalizedAmount },
      },
      { $inc: { userLoyaltyPointsReserved: -normalizedAmount } },
      withMongoSession({}, session),
    );

    if (result.matchedCount === 0) {
      throw new Error("LOYALTY_RESERVE_RELEASE_FAILED");
    }

    logMoneyEvent("info", "loyalty_release", {
      userId: String(userId),
      amount: normalizedAmount,
      currency: "LP",
    });
  } catch (error) {
    logMoneyFailure(
      "loyalty_release",
      { userId: String(userId), amount: normalizedAmount, currency: "LP" },
      error,
    );
    throw error;
  }
};

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession | null }} params
 * @returns {Promise<number>}
 */
export const chargeReservedLoyaltyPoints = async ({
  userId,
  amount,
  session = null,
}) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    throw new Error("Сумма списания должна быть больше 0");
  }

  try {
    const updated = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        userLoyaltyPoints: { $gte: normalizedAmount },
        userLoyaltyPointsReserved: { $gte: normalizedAmount },
      },
      {
        $inc: {
          userLoyaltyPoints: -normalizedAmount,
          userLoyaltyPointsReserved: -normalizedAmount,
        },
      },
      withMongoSession({ returnDocument: "after" }, session),
    ).lean();

    if (!updated) {
      const userLookup = UserModel.findById(userId).select(
        "userLoyaltyPoints userLoyaltyPointsReserved",
      );
      if (session) {
        userLookup.session(session);
      }
      const user = await userLookup.lean();
      const available = getSellerLoyaltyPointsAvailable(user);
      throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }

    const balance = Number(updated.userLoyaltyPoints) || 0;
    logMoneyEvent("info", "loyalty_charge_reserved", {
      userId: String(userId),
      amount: normalizedAmount,
      currency: "LP",
      balanceAfter: balance,
    });
    return balance;
  } catch (error) {
    logMoneyFailure(
      "loyalty_charge_reserved",
      { userId: String(userId), amount: normalizedAmount, currency: "LP" },
      error,
    );
    throw error;
  }
};

/**
 * @param {{ sellerId: string; buyerId: string; amount: number; session?: import('mongoose').ClientSession | null }} params
 */
export const settleLoyaltyPointsReservation = async ({
  sellerId,
  buyerId,
  amount,
  session = null,
}) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    return;
  }

  try {
    const sellerUpdated = await UserModel.findOneAndUpdate(
      {
        _id: sellerId,
        userLoyaltyPoints: { $gte: normalizedAmount },
        userLoyaltyPointsReserved: { $gte: normalizedAmount },
      },
      {
        $inc: {
          userLoyaltyPoints: -normalizedAmount,
          userLoyaltyPointsReserved: -normalizedAmount,
        },
      },
      withMongoSession({ returnDocument: "after" }, session),
    ).lean();

    if (!sellerUpdated) {
      const sellerLookup = UserModel.findById(sellerId).select(
        "userLoyaltyPoints userLoyaltyPointsReserved",
      );
      if (session) {
        sellerLookup.session(session);
      }
      const user = await sellerLookup.lean();
      const available = getSellerLoyaltyPointsAvailable(user);
      throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }

    await UserModel.updateOne(
      { _id: buyerId },
      { $inc: { userLoyaltyPoints: normalizedAmount } },
      withMongoSession({}, session),
    );

    logMoneyEvent("info", "loyalty_settle", {
      userId: String(sellerId),
      buyerId: String(buyerId),
      amount: normalizedAmount,
      currency: "LP",
    });
  } catch (error) {
    logMoneyFailure(
      "loyalty_settle",
      {
        userId: String(sellerId),
        buyerId: String(buyerId),
        amount: normalizedAmount,
        currency: "LP",
      },
      error,
    );
    throw error;
  }
};

/**
 * @param {{ sellerId: string; amount: number }[]} totals
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const reserveLoyaltyPointsBySellerTotals = async (totals, session = null) => {
  /** @type {{ sellerId: string; amount: number }[]} */
  const applied = [];

  try {
    for (const row of totals) {
      const amount = Math.ceil(Number(row.amount));
      if (amount <= 0) {
        continue;
      }
      await reserveLoyaltyPoints({
        userId: row.sellerId,
        amount,
        session,
      });
      applied.push({ sellerId: row.sellerId, amount });
    }
  } catch (error) {
    await releaseLoyaltyPointsBySellerTotals(applied, session);
    throw error;
  }
};

/**
 * @param {{ sellerId: string; amount: number }[]} totals
 * @param {import('mongoose').ClientSession | null} [session]
 */
export const releaseLoyaltyPointsBySellerTotals = async (totals, session = null) => {
  for (const row of totals) {
    try {
      await releaseLoyaltyPointsReservation({
        userId: row.sellerId,
        amount: row.amount,
        session,
      });
    } catch (releaseError) {
      logServerEvent("error", {
        event: "money.loyalty_release_batch_failed",
        userId: String(row.sellerId),
        amount: row.amount,
        ...formatLogError(releaseError),
      });
    }
  }
};

/**
 * @param {Array<{
 *   loyaltyPointsReservedTotal?: number;
 *   loyaltyPointsReserveReleased?: boolean;
 *   loyaltyPointsAwarded?: boolean;
 *   productId?: { productSeller?: unknown } | string;
 * }>} items
 */
export const buildSellerReserveTotalsFromOrderItems = (items) => {
  /** @type {Map<string, number>} */
  const bySeller = new Map();

  for (const item of items) {
    if (item?.loyaltyPointsReserveReleased || item?.loyaltyPointsAwarded) {
      continue;
    }
    const total = Math.ceil(Number(item.loyaltyPointsReservedTotal) || 0);
    if (total <= 0) {
      continue;
    }
    const product = item.productId;
    const sellerRaw =
      product && typeof product === "object"
        ? (product.productSeller?._id ?? product.productSeller)
        : null;
    const sellerId = sellerRaw != null ? String(sellerRaw) : "";
    if (!sellerId) {
      continue;
    }
    bySeller.set(sellerId, (bySeller.get(sellerId) ?? 0) + total);
  }

  return [...bySeller.entries()].map(([sellerId, amount]) => ({
    sellerId,
    amount,
  }));
};
