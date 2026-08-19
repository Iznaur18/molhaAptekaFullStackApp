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
 *   catalogRentalOnly?: boolean;
 *   catalogAffiliateOnly?: boolean;
 *   catalogWholesaleOnly?: boolean;
 *   catalogOriginalOnly?: boolean;
 *   catalogNear?: boolean;
 *   catalogFlashSaleOnly?: boolean;
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
  catalogRentalOnly = false,
  catalogAffiliateOnly = false,
  catalogWholesaleOnly = false,
  catalogOriginalOnly = false,
  catalogNear = false,
  catalogFlashSaleOnly = false,
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
    !catalogSaleOnly &&
    !catalogRentalOnly &&
    !catalogAffiliateOnly &&
    !catalogWholesaleOnly &&
    !catalogOriginalOnly &&
    !catalogNear &&
    !catalogFlashSaleOnly
  );
}
