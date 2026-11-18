import { isUserSellerClosedNow } from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * Продавцы с включённым графиком, которые сейчас закрыты.
 * Свои товары зритель всё равно видит — `excludeUserId` выкидывает его из списка.
 *
 * @param {{
 *   excludeUserId?: string | null;
 *   at?: Date;
 * }} [input]
 * @returns {Promise<import("mongoose").Types.ObjectId[]>}
 */
export async function getClosedSellerIdsNow({
  excludeUserId = null,
  at = new Date(),
} = {}) {
  const rows = await UserModel.find({ userBusinessHoursEnabled: true })
    .select("_id userBusinessHoursEnabled userBusinessHours userRegionCode")
    .lean();

  const excludeId =
    excludeUserId != null && String(excludeUserId).trim() !== ""
      ? String(excludeUserId)
      : null;

  return rows
    .filter((row) => {
      if (excludeId != null && String(row._id) === excludeId) {
        return false;
      }
      return isUserSellerClosedNow(row, at);
    })
    .map((row) => row._id);
}
