import {
  EMPTY_CATALOG_EXTRA_FILTERS,
  pickCatalogExtraFilters,
} from "./catalogCatalogQuery.js";

/**
 * Сериализуемые параметры списка каталога / «мои товары» для queryKey.
 *
 * @param {object} input
 */
export function buildCatalogListQueryParams({
  isMineMode,
  isCatalogBrowserMainViewActive,
  activeCatalogBrowserCategory,
  activeCatalogBrowserCategoryId,
  catalogQueryFromUrl,
  appliedProductSearchTerm,
  selectedProductCategory,
  catalogSort,
  myProductsModerationFilter,
  viewerRegionCode = null,
  nearAllowed = true,
}) {
  const search = appliedProductSearchTerm.trim();
  const sellerPersonalCategoryId = isMineMode
    ? null
    : (catalogQueryFromUrl.sellerPersonalCategoryId ?? null);
  const categoryId = isMineMode ? null : (activeCatalogBrowserCategoryId ?? null);
  const productCategory = isMineMode
    ? (selectedProductCategory ?? null)
    : !categoryId && !sellerPersonalCategoryId
      ? (activeCatalogBrowserCategory ??
        (!isCatalogBrowserMainViewActive ? selectedProductCategory : null) ??
        null)
      : null;
  // «Мои товары» эти фильтры не принимают.
  const extra = isMineMode
    ? EMPTY_CATALOG_EXTRA_FILTERS
    : pickCatalogExtraFilters(catalogQueryFromUrl);

  return {
    scope: isMineMode ? "my" : "catalog",
    search: search || null,
    productCategory,
    categoryId,
    sellerPersonalCategoryId,
    sort: isMineMode ? catalogSort || null : catalogQueryFromUrl.sort || null,
    moderationStatus: isMineMode ? myProductsModerationFilter || null : null,
    followingOnly: catalogQueryFromUrl.followingOnly ? true : null,
    auctionOnly: catalogQueryFromUrl.auctionOnly ? true : null,
    installmentOnly: catalogQueryFromUrl.installmentOnly ? true : null,
    saleOnly: catalogQueryFromUrl.saleOnly ? true : null,
    rentalOnly: catalogQueryFromUrl.rentalOnly ? true : null,
    affiliateOnly: catalogQueryFromUrl.affiliateOnly ? true : null,
    wholesaleOnly: catalogQueryFromUrl.wholesaleOnly ? true : null,
    buyNFreeOnly: catalogQueryFromUrl.buyNFreeOnly ? true : null,
    originalOnly: catalogQueryFromUrl.originalOnly ? true : null,
    near: catalogQueryFromUrl.near && nearAllowed ? true : null,
    flashSaleOnly: catalogQueryFromUrl.flashSaleOnly ? true : null,
    priceMin: extra.priceMin,
    priceMax: extra.priceMax,
    delivery: extra.delivery.length > 0 ? extra.delivery.join(",") : null,
    pickupOnly: extra.pickupOnly ? true : null,
    ratingMin: extra.ratingMin,
    withReviews: extra.withReviews ? true : null,
    returnOnly: extra.returnOnly ? true : null,
    sellerConfirmed: extra.sellerConfirmed ? true : null,
    sellerPremium: extra.sellerPremium ? true : null,
    regionCode: isMineMode ? null : viewerRegionCode || null,
  };
}
