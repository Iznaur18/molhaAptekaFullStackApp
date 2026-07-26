/**
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   isMineMode: boolean;
 *   selectedProductCategory: string | null;
 *   selectedCategoryId: string | null;
 *   hasProductSearchQuery: boolean;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 * }} params
 */
export function isHomeCuratedProductListsVisible({
  isHomeCatalogMainView,
  isMineMode,
  selectedProductCategory,
  selectedCategoryId,
  sellerPersonalCategoryId = null,
  hasProductSearchQuery,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
}) {
  return (
    isHomeCatalogMainView &&
    !isMineMode &&
    !selectedProductCategory &&
    !selectedCategoryId &&
    !sellerPersonalCategoryId &&
    !hasProductSearchQuery &&
    !catalogFollowingOnly &&
    !catalogAuctionOnly &&
    !catalogInstallmentOnly &&
    !catalogSaleOnly
  );
}
