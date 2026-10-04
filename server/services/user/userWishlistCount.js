import mongoose from "mongoose";

import { WishlistModel } from "../../models/index.js";

/**
 * @param {unknown} items `Wishlist.items` — объект `{ productId: addedAt }`.
 * @returns {number}
 */
export const countWishlistItems = (items) => {
  if (items == null || typeof items !== "object" || Array.isArray(items)) {
    return 0;
  }

  return Object.keys(items).filter((productId) => mongoose.isValidObjectId(productId))
    .length;
};

/**
 * Сколько товаров в списке желаний пользователя. Наружу отдаём только число:
 * сам список видит лишь владелец (`GET /favorites`).
 *
 * @param {{ userId: unknown }} params
 * @returns {Promise<number>}
 */
export const getUserWishlistCount = async ({ userId }) => {
  if (!mongoose.isValidObjectId(userId)) {
    return 0;
  }

  const doc = await WishlistModel.findOne({ userId }).select("items").lean();
  return countWishlistItems(doc?.items);
};

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export const attachWishlistCountToUser = async (user) => {
  if (!user || user._id == null) {
    return user;
  }

  return { ...user, wishlistCount: await getUserWishlistCount({ userId: user._id }) };
};
