/**
 * @param {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem[]} items
 * @returns {import('../../product/model/types.js').ProductFromApi[]}
 */
export function mapSellerCatalogItemsToProducts(items) {
  return items
    .filter((item) => item.viewable && item.product != null)
    .map((item) => item.product);
}
