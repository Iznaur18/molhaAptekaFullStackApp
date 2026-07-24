/**
 * @param {unknown} product
 * @returns {string | null}
 */
export function getProductSellerId(product) {
  if (product == null || typeof product !== "object") {
    return null;
  }
  const seller = /** @type {{ productSeller?: unknown }} */ (product).productSeller;
  if (seller == null) {
    return null;
  }
  if (typeof seller === "object" && seller !== null && "_id" in seller) {
    return String(/** @type {{ _id: unknown }} */ (seller)._id);
  }
  return String(seller);
}
