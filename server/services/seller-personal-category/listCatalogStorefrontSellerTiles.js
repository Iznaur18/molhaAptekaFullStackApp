import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel, UserModel } from "../../models/index.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";

/** Потолок витрин без платной плитки — чтобы ответ не раздувался. */
export const SELLER_STOREFRONT_CATALOG_TILE_LIMIT = 500;

const STOREFRONT_TILE_ID_PREFIX = "storefront:";

export function buildStorefrontSellerTileId(sellerId) {
  return `${STOREFRONT_TILE_ID_PREFIX}${String(sellerId)}`;
}

/**
 * Продавцы с хотя бы одним видимым товаром в каталоге (без платной личной категории).
 *
 * @param {{ excludeSellerIds?: string[] }} [input]
 */
export async function listCatalogStorefrontSellerTiles({
  excludeSellerIds = [],
} = {}) {
  const hiddenSellerIds = await getHiddenSellerIds();
  const excludeSet = new Set([
    ...excludeSellerIds.map(String),
    ...hiddenSellerIds.map(String),
  ]);

  /** @type {Record<string, unknown>} */
  const match = {
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
    $or: [{ productOutOfStock: true }, { productStockQuantity: { $gt: 0 } }],
  };
  if (hiddenSellerIds.length > 0) {
    match.productSeller = { $nin: hiddenSellerIds };
  }

  const sellerIds = await ProductModel.distinct("productSeller", match);
  const filtered = sellerIds
    .map((id) => String(id))
    .filter((id) => id && !excludeSet.has(id))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, SELLER_STOREFRONT_CATALOG_TILE_LIMIT);

  if (filtered.length === 0) {
    return [];
  }

  const users = await UserModel.find({
    _id: { $in: filtered.map((id) => new mongoose.Types.ObjectId(id)) },
    isActiveUser: { $ne: false },
    isBlockedUser: { $ne: true },
  })
    .select("_id userName userAvatarUrl")
    .lean();

  const userById = new Map(users.map((row) => [String(row._id), row]));

  return filtered
    .map((sellerId) => {
      const user = userById.get(sellerId);
      const labelRu = String(user?.userName ?? "").trim();
      if (!user || !labelRu) {
        return null;
      }

      return {
        _id: buildStorefrontSellerTileId(sellerId),
        sellerId,
        labelRu,
        imageUrl: user.userAvatarUrl ?? null,
        regionCode: null,
        activeUntil: null,
      };
    })
    .filter(Boolean);
}