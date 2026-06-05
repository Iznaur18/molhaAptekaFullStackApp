import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_NEWEST,
} from "../../product/model/productConstants.js";

/**
 * @param {{
 *   sort: string;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 * }} query
 * @returns {string | null}
 */
export function resolveActiveCatalogFeedLabel(query) {
  if (query.followingOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_FOLLOWING_ONLY];
  }
  if (query.auctionOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_AUCTION_ONLY];
  }
  if (query.installmentOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_INSTALLMENT_ONLY];
  }
  if (query.saleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_SALE_ONLY];
  }
  if (query.sort === CATALOG_SORT_NEWEST) {
    return CATALOG_SORT_LABEL_RU[CATALOG_SORT_NEWEST];
  }
  return CATALOG_SORT_LABEL_RU[query.sort] ?? null;
}
