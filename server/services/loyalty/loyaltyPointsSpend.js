import { UserModel } from "../../models/index.js";

import { getSellerLoyaltyPointsAvailable } from "./loyaltyPointsSeller.js";

export class InsufficientLoyaltyPointsError extends Error {
  /**
   * @param {number} required
   * @param {number} available
   */
  constructor(required, available) {
    super("Недостаточно баллов");
    this.name = "InsufficientLoyaltyPointsError";
    this.required = required;
    this.available = available;
  }
}

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 * @returns {Promise<number>} баланс после списания
 */
export const deductLoyaltyPoints = async ({ userId, amount, session }) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    throw new Error("Сумма списания должна быть больше 0");
  }

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
    { $inc: { userLoyaltyPoints: -normalizedAmount } },
    { returnDocument: "after", session: session ?? undefined },
  ).lean();

  if (!updated) {
    const user = await UserModel.findById(userId)
      .select("userLoyaltyPoints userLoyaltyPointsReserved")
      .lean();
    const available = getSellerLoyaltyPointsAvailable(user);
    throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
  }

  return Number(updated.userLoyaltyPoints) || 0;
};

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 */
/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 * @returns {Promise<number>}
 */
export const creditLoyaltyPoints = async ({ userId, amount, session }) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    throw new Error("Сумма начисления должна быть больше 0");
  }

  const updated = await UserModel.findOneAndUpdate(
    { _id: userId },
    { $inc: { userLoyaltyPoints: normalizedAmount } },
    { returnDocument: "after", session: session ?? undefined },
  ).lean();

  if (!updated) {
    throw new Error("USER_NOT_FOUND");
  }

  return Number(updated.userLoyaltyPoints) || 0;
};

export const refundLoyaltyPoints = async ({ userId, amount, session }) => {
  const normalizedAmount = Math.ceil(Number(amount));
  if (normalizedAmount <= 0) {
    return;
  }

  await UserModel.updateOne(
    { _id: userId },
    { $inc: { userLoyaltyPoints: normalizedAmount } },
    { session: session ?? undefined },
  );
};
