/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @param {string | null | undefined} currentUserId
 */
export function isCurrentUserProductSeller(product, currentUserId) {
  if (!currentUserId) {
    return false;
  }
  const seller = product.productSeller;
  if (seller == null || typeof seller !== "object" || seller._id == null) {
    return false;
  }
  return String(seller._id) === String(currentUserId);
}
