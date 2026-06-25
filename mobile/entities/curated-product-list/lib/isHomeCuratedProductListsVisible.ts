/** Паритет с `client/.../isHomeCuratedProductListsVisible.js`. */
export type HomeCuratedProductListsVisibilityParams = {
  isHomeCatalogMainView: boolean;
  isMineMode?: boolean;
  selectedProductCategory: string | null;
  selectedCategoryId: string | null;
  hasProductSearchQuery: boolean;
  catalogFollowingOnly: boolean;
  catalogAuctionOnly: boolean;
  catalogInstallmentOnly: boolean;
  catalogSaleOnly: boolean;
  showHiddenCatalogProducts?: boolean;
};

export const isHomeCuratedProductListsVisible = ({
  isHomeCatalogMainView,
  isMineMode = false,
  selectedProductCategory,
  selectedCategoryId,
  hasProductSearchQuery,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  showHiddenCatalogProducts = false,
}: HomeCuratedProductListsVisibilityParams): boolean =>
  isHomeCatalogMainView &&
  !isMineMode &&
  !selectedProductCategory &&
  !selectedCategoryId &&
  !hasProductSearchQuery &&
  !catalogFollowingOnly &&
  !catalogAuctionOnly &&
  !catalogInstallmentOnly &&
  !catalogSaleOnly &&
  !showHiddenCatalogProducts;
