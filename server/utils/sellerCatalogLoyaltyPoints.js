import mongoose from "mongoose";

import { ProductModel } from "../models/index.js";

const { ObjectId } = mongoose.Types;

/**
 * Сумма `loyaltyPointsPerUnit` по всем товарам продавца (кроме excludeProductId).
 *
 * @param {string} sellerId
 * @param {string | null} [excludeProductId]
 */
export const sumSellerCatalogLoyaltyPointsPerUnit = async (
  sellerId,
  excludeProductId = null,
) => {
  /** @type {Record<string, unknown>} */
  const match = { productSeller: sellerId };
  if (excludeProductId != null && ObjectId.isValid(String(excludeProductId))) {
    match._id = { $ne: new ObjectId(String(excludeProductId)) };
  }

  const [row] = await ProductModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $ifNull: ["$loyaltyPointsPerUnit", 0],
          },
        },
      },
    },
  ]);

  const total = Math.floor(Number(row?.total));
  if (!Number.isFinite(total) || total < 0) {
    return 0;
  }
  return total;
};
