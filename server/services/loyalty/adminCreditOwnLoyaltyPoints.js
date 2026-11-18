import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import { creditLoyaltyPoints } from "./loyaltyPointsSpend.js";
import { runMoneyIdempotentMutation } from "./runMoneyIdempotentMutation.js";

/**
 * @param {{ userId: string }} args
 */
export async function getMyLoyaltyPointsStatus({ userId }) {
  const user = await UserModel.findById(userId)
    .select("userLoyaltyPoints userLoyaltyPointsReserved")
    .lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  return {
    loyaltyPointsBalance: Number(user.userLoyaltyPoints) || 0,
    loyaltyPointsReserved: Number(user.userLoyaltyPointsReserved) || 0,
  };
}

/**
 * Бесплатное начисление баллов себе (только admin, проверка роли снаружи).
 * @param {{ userId: string; amount: number; idempotencyKey: string }} input
 * @returns {Promise<{ loyaltyPointsBalance: number; credited: number; duplicate?: boolean }>}
 */
export async function adminCreditOwnLoyaltyPoints({ userId, amount, idempotencyKey }) {
  const points = Math.floor(Number(amount));
  if (!Number.isFinite(points) || points <= 0) {
    throw new AppError(400, "Сумма начисления должна быть больше 0");
  }

  return runMoneyIdempotentMutation({
    scope: "admin_free_credit",
    actorUserId: userId,
    idempotencyKey,
    execute: async () => {
      try {
        const loyaltyPointsBalance = await creditLoyaltyPoints({
          userId,
          amount: points,
        });
        return { loyaltyPointsBalance, credited: points };
      } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
          throw new AppError(404, "Пользователь не найден");
        }
        throw error;
      }
    },
  });
}
