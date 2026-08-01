import { AppError } from "../../errors/AppError.js";
import { creditLoyaltyPoints } from "./loyaltyPointsSpend.js";
import { runMoneyIdempotentMutation } from "./runMoneyIdempotentMutation.js";

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
