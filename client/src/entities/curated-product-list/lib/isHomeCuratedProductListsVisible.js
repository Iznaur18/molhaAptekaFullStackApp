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
 *   showHiddenCatalogProducts: boolean;
 * }} params
 */
export function isHomeCuratedProductListsVisible({
  isHomeCatalogMainView,
  isMineMode,
  selectedProductCategory,
  selectedCategoryId,
  hasProductSearchQuery,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  showHiddenCatalogProducts,
}) {
  return (
    isHomeCatalogMainView &&
    !isMineMode &&
    !selectedProductCategory &&
    !selectedCategoryId &&
    !hasProductSearchQuery &&
    !catalogFollowingOnly &&
    !catalogAuctionOnly &&
    !catalogInstallmentOnly &&
    !catalogSaleOnly &&
    !showHiddenCatalogProducts
  );
}
