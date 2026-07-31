import { UserModel } from "../../models/index.js";

/**
 * 3A: остаток affiliateBudget → userLoyaltyPoints (1:1), budget = 0.
 * Идемпотентно: повторный вызов no-op.
 *
 * @param {string} userId
 * @param {import("mongoose").ClientSession | null | undefined} [session]
 * @returns {Promise<number>} сколько баллов вернули
 */
export async function migrateAffiliateBudgetToLoyaltyPoints(userId, session) {
  const sessionOpt = session ? { session } : {};
  const current = await UserModel.findOne({
    _id: userId,
    affiliateBudget: { $gt: 0 },
  })
    .select("affiliateBudget")
    .session(session ?? null)
    .lean();

  if (!current) {
    return 0;
  }

  const amount = Math.ceil(Number(current.affiliateBudget) || 0);
  if (amount <= 0) {
    return 0;
  }

  const updated = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      affiliateBudget: { $gte: amount },
    },
    {
      $inc: {
        userLoyaltyPoints: amount,
        affiliateBudget: -amount,
      },
    },
    {
      returnDocument: "after",
      ...sessionOpt,
    },
  )
    .select("affiliateBudget")
    .lean();

  if (!updated) {
    return 0;
  }

  return amount;
}
