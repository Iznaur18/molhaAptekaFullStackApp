import type { WishlistItemsByProductId } from "../model/types";

export const coerceWishlistItemsFromApi = (rawItems: unknown): WishlistItemsByProductId => {
  if (rawItems == null || typeof rawItems !== "object" || Array.isArray(rawItems)) {
    return {};
  }

  return Object.entries(rawItems).reduce<WishlistItemsByProductId>((acc, [productId, addedAt]) => {
    const ts = Math.floor(Number(addedAt));
    if (!productId || !Number.isFinite(ts) || ts <= 0) {
      return acc;
    }
    acc[String(productId)] = ts;
    return acc;
  }, {});
};
