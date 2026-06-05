import {
  CATALOG_QUERY_PARAM_AUCTION_ONLY,
  CATALOG_QUERY_PARAM_CATEGORY,
  CATALOG_QUERY_PARAM_CATEGORY_ID,
  CATALOG_QUERY_PARAM_FOLLOWING_ONLY,
  CATALOG_QUERY_PARAM_INSTALLMENT_ONLY,
  CATALOG_QUERY_PARAM_SALE_ONLY,
  CATALOG_QUERY_PARAM_SORT,
} from "../../../pages/home/lib/catalogCatalogQuery.js";

/**
 * @param {string} search
 * @param {boolean} hasProductSearchQuery
 */
export function isCatalogBrowserLandingSearch(search, hasProductSearchQuery) {
  if (hasProductSearchQuery) {
    return false;
  }

  const params = new URLSearchParams(search);
  return (
    !params.has(CATALOG_QUERY_PARAM_CATEGORY) &&
    !params.has(CATALOG_QUERY_PARAM_CATEGORY_ID) &&
    !params.has(CATALOG_QUERY_PARAM_SORT) &&
    !params.has(CATALOG_QUERY_PARAM_FOLLOWING_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_AUCTION_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_INSTALLMENT_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_SALE_ONLY)
  );
}
