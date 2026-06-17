import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel } from "../../models/index.js";

/**
 * Число одобренных и видимых в каталоге товаров продавца.
 *
 * @param {string[]} sellerIds
 * @returns {Promise<Record<string, number>>}
 */
export const getSellerListedProductCountByIds = async (sellerIds) => {
  const ids = [
    ...new Set(
      sellerIds.map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];

  if (ids.length === 0) {
    return {};
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await ProductModel.aggregate([
    {
      $match: {
        productSeller: { $in: objectIds },
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productIsAvailable: { $ne: false },
      },
    },
    {
      $group: {
        _id: "$productSeller",
        sellerListedProductCount: { $sum: 1 },
      },
    },
  ]);

  return Object.fromEntries(
    rows.map((row) => [String(row._id), Number(row.sellerListedProductCount) || 0]),
  );
};
