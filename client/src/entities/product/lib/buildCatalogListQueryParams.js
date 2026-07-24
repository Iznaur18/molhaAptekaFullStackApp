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
  canModerateProducts,
  showHiddenCatalogProducts,
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

  return {
    scope: isMineMode ? "my" : "catalog",
    search: search || null,
    productCategory,
    categoryId,
    sellerPersonalCategoryId,
    sort: isMineMode ? catalogSort || null : catalogQueryFromUrl.sort || null,
    moderationStatus: isMineMode ? myProductsModerationFilter || null : null,
    includeHidden:
      canModerateProducts && !isMineMode && showHiddenCatalogProducts ? true : null,
    followingOnly: catalogQueryFromUrl.followingOnly ? true : null,
    auctionOnly: catalogQueryFromUrl.auctionOnly ? true : null,
    installmentOnly: catalogQueryFromUrl.installmentOnly ? true : null,
    saleOnly: catalogQueryFromUrl.saleOnly ? true : null,
    allCities: catalogQueryFromUrl.allCities ? true : null,
  };
}
