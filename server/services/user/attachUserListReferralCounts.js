import mongoose from "mongoose";

import { UserModel } from "../../models/index.js";

/**
 * Сколько человек зарегистрировалось по ссылке каждого пользователя списка.
 * Считает по `referredByUserId` (индекс `{ referredByUserId: 1, createdAt: -1 }`).
 *
 * @param {unknown[]} users
 * @returns {Promise<Record<string, unknown>[]>}
 */
export const attachUserListReferralCounts = async (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    return /** @type {Record<string, unknown>[]} */ (users);
  }

  const objectIds = users
    .map((user) => String(user?._id ?? ""))
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const aggregated =
    objectIds.length === 0
      ? []
      : await UserModel.aggregate([
          { $match: { referredByUserId: { $in: objectIds } } },
          { $group: { _id: "$referredByUserId", count: { $sum: 1 } } },
        ]);

  const byUserId = new Map(
    aggregated.map((row) => [String(row._id), Math.max(0, Number(row.count) || 0)]),
  );

  return users.map((user) => ({
    .../** @type {Record<string, unknown>} */ (user),
    referredUsersCount: byUserId.get(String(user?._id)) ?? 0,
  }));
};
