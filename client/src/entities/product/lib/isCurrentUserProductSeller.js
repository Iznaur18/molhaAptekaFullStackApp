/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @param {string | null | undefined} currentUserId
 */
export function isCurrentUserProductSeller(product, currentUserId) {
  if (!currentUserId) {
    return false;
  }
  const seller = product.productSeller;
  if (seller == null) {
    return false;
  }
  if (typeof seller === "object" && seller._id != null) {
    return String(seller._id) === String(currentUserId);
  }
  return String(seller) === String(currentUserId);
}
