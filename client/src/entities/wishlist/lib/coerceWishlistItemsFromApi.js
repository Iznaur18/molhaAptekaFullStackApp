/**
 * @param {unknown} rawItems
 * @returns {import('../model/types.js').WishlistItemsByProductId}
 */
export function coerceWishlistItemsFromApi(rawItems) {
  if (rawItems == null || typeof rawItems !== "object" || Array.isArray(rawItems)) {
    return {};
  }

  return Object.entries(rawItems).reduce((acc, [productId, addedAt]) => {
    const ts = Math.floor(Number(addedAt));
    if (!productId || !Number.isFinite(ts) || ts <= 0) {
      return acc;
    }
    acc[String(productId)] = ts;
    return acc;
  }, /** @type {import('../model/types.js').WishlistItemsByProductId} */ ({}));
}
