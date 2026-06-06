import {
  CATALOG_QUERY_PARAM_AUCTION_ONLY,
  CATALOG_QUERY_PARAM_CATEGORY,
  CATALOG_QUERY_PARAM_CATEGORY_ID,
  CATALOG_QUERY_PARAM_FOLLOWING_ONLY,
  CATALOG_QUERY_PARAM_INSTALLMENT_ONLY,
  CATALOG_QUERY_PARAM_SALE_ONLY,
  CATALOG_QUERY_PARAM_SORT,
} from "../../../pages/home/lib/catalogCatalogQuery.js";
import { CATALOG_SORT_NEWEST } from "../../product/model/productConstants.js";

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

/**
 * Явная лента «Новинки»: только `?sort=newest`, без категории и фильтров.
 * Отличается от лендинга `/catalog` (без query).
 *
 * @param {string} search
 */
export function isExplicitCatalogNewestFeedSearch(search) {
  const params = new URLSearchParams(search);
  if (params.get(CATALOG_QUERY_PARAM_SORT) !== CATALOG_SORT_NEWEST) {
    return false;
  }

  return (
    !params.has(CATALOG_QUERY_PARAM_CATEGORY) &&
    !params.has(CATALOG_QUERY_PARAM_CATEGORY_ID) &&
    !params.has(CATALOG_QUERY_PARAM_FOLLOWING_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_AUCTION_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_INSTALLMENT_ONLY) &&
    !params.has(CATALOG_QUERY_PARAM_SALE_ONLY)
  );
}
