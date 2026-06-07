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
  debouncedProductSearchTerm,
  selectedProductCategory,
  catalogSort,
  myProductsModerationFilter,
  canModerateProducts,
  showHiddenCatalogProducts,
}) {
  const search = debouncedProductSearchTerm.trim();
  const productCategory = isMineMode
    ? (selectedProductCategory ?? null)
    : isCatalogBrowserMainViewActive && !activeCatalogBrowserCategoryId
      ? (activeCatalogBrowserCategory ?? null)
      : null;
  const categoryId = isCatalogBrowserMainViewActive
    ? (activeCatalogBrowserCategoryId ?? null)
    : null;

  return {
    scope: isMineMode ? "my" : "catalog",
    search: search || null,
    productCategory,
    categoryId,
    sort: isMineMode ? catalogSort || null : catalogQueryFromUrl.sort || null,
    moderationStatus: isMineMode ? myProductsModerationFilter || null : null,
    includeHidden:
      canModerateProducts && !isMineMode && showHiddenCatalogProducts ? true : null,
    followingOnly: catalogQueryFromUrl.followingOnly ? true : null,
    auctionOnly: catalogQueryFromUrl.auctionOnly ? true : null,
    installmentOnly: catalogQueryFromUrl.installmentOnly ? true : null,
    saleOnly: catalogQueryFromUrl.saleOnly ? true : null,
  };
}
