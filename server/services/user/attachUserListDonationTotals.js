import mongoose from "mongoose";

import {
  PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
  PAYMENT_STATUS_SUCCEEDED,
} from "../../constants/yookassaConstants.js";
import { PaymentModel } from "../../models/index.js";

/**
 * Lifetime-сумма успешных пожертвований по пользователям списка.
 * @param {unknown[]} users
 * @returns {Promise<Record<string, unknown>[]>}
 */
export const attachUserListDonationTotals = async (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    return /** @type {Record<string, unknown>[]} */ (users);
  }

  const objectIds = [];
  for (const user of users) {
    if (user?._id == null) continue;
    try {
      objectIds.push(new mongoose.Types.ObjectId(String(user._id)));
    } catch {
      // skip invalid id
    }
  }

  if (objectIds.length === 0) {
    return users.map((user) => ({
      .../** @type {Record<string, unknown>} */ (user),
      totalDonatedRub: 0,
    }));
  }

  const aggregated = await PaymentModel.aggregate([
    {
      $match: {
        purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
        status: PAYMENT_STATUS_SUCCEEDED,
        userId: { $in: objectIds },
      },
    },
    {
      $group: {
        _id: "$userId",
        total: { $sum: { $ifNull: ["$appliedAmount", 0] } },
      },
    },
  ]);

  const byUserId = new Map(
    aggregated.map((row) => [
      String(row._id),
      Math.max(0, Math.floor(Number(row.total) || 0)),
    ]),
  );

  return users.map((user) => ({
    .../** @type {Record<string, unknown>} */ (user),
    totalDonatedRub: byUserId.get(String(user?._id)) ?? 0,
  }));
};
