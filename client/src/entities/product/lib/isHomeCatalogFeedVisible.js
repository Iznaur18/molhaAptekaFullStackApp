/**
 * Home-лента (сторис / raffles / curated), а не отфильтрованная выдача.
 * Паритет с mobile `isHomeCatalogMainView`.
 *
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   hasProductSearchQuery?: boolean;
 *   selectedProductCategory?: string | null;
 *   selectedCategoryId?: string | null;
 *   sellerPersonalCategoryId?: string | null;
 *   catalogFollowingOnly?: boolean;
 *   catalogAuctionOnly?: boolean;
 *   catalogInstallmentOnly?: boolean;
 *   catalogSaleOnly?: boolean;
 *   catalogRentalOnly?: boolean;
 *   catalogAffiliateOnly?: boolean;
 *   catalogWholesaleOnly?: boolean;
 *   catalogOriginalOnly?: boolean;
 *   catalogNear?: boolean;
 * }} params
 */
export function isHomeCatalogFeedVisible({
  isHomeCatalogMainView,
  hasProductSearchQuery = false,
  selectedProductCategory = null,
  selectedCategoryId = null,
  sellerPersonalCategoryId = null,
  catalogFollowingOnly = false,
  catalogAuctionOnly = false,
  catalogInstallmentOnly = false,
  catalogSaleOnly = false,
  catalogRentalOnly = false,
  catalogAffiliateOnly = false,
  catalogWholesaleOnly = false,
  catalogOriginalOnly = false,
  catalogNear = false,
}) {
  return (
    isHomeCatalogMainView &&
    !hasProductSearchQuery &&
    !selectedProductCategory &&
    !selectedCategoryId &&
    !sellerPersonalCategoryId &&
    !catalogFollowingOnly &&
    !catalogAuctionOnly &&
    !catalogInstallmentOnly &&
    !catalogSaleOnly &&
    !catalogRentalOnly &&
    !catalogAffiliateOnly &&
    !catalogWholesaleOnly &&
    !catalogOriginalOnly &&
    !catalogNear
  );
}
