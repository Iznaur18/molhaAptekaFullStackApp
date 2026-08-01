import { UserModel } from "../../models/index.js";

/**
 * Остаток partnerBalance → userLoyaltyPoints (1:1), partnerBalance = 0.
 * Идемпотентно: повторный вызов no-op.
 *
 * @param {string} userId
 * @param {import("mongoose").ClientSession | null | undefined} [session]
 * @returns {Promise<number>} сколько баллов перенесли
 */
export async function migratePartnerBalanceToLoyaltyPoints(userId, session) {
  const sessionOpt = session ? { session } : {};
  const current = await UserModel.findOne({
    _id: userId,
    partnerBalance: { $gt: 0 },
  })
    .select("partnerBalance")
    .session(session ?? null)
    .lean();

  if (!current) {
    return 0;
  }

  const amount = Math.ceil(Number(current.partnerBalance) || 0);
  if (amount <= 0) {
    return 0;
  }

  const updated = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      partnerBalance: { $gte: amount },
    },
    {
      $inc: {
        userLoyaltyPoints: amount,
        partnerBalance: -amount,
      },
    },
    {
      returnDocument: "after",
      ...sessionOpt,
    },
  )
    .select("partnerBalance")
    .lean();

  if (!updated) {
    return 0;
  }

  return amount;
}
