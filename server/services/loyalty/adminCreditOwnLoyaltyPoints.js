import { AppError } from "../../errors/AppError.js";
import { creditLoyaltyPoints } from "./loyaltyPointsSpend.js";

/**
 * Бесплатное начисление баллов себе (только admin, проверка роли снаружи).
 * @param {{ userId: string; amount: number }} input
 * @returns {Promise<{ loyaltyPointsBalance: number; credited: number }>}
 */
export async function adminCreditOwnLoyaltyPoints({ userId, amount }) {
  const points = Math.floor(Number(amount));
  if (!Number.isFinite(points) || points <= 0) {
    throw new AppError(400, "Сумма начисления должна быть больше 0");
  }

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
}
