import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
} from "../../../entities/product/model/productConstants.js";

/**
 * @param {{
 *   catalogSort: string;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 * }}
 */
export function getCatalogSelectValue({
  catalogSort,
  catalogFollowingOnly,
  catalogAuctionOnly,
}) {
  if (catalogFollowingOnly) return CATALOG_FILTER_FOLLOWING_ONLY;
  if (catalogAuctionOnly) return CATALOG_FILTER_AUCTION_ONLY;
  return catalogSort;
}

/**
 * @param {string} value
 * @returns {value is typeof CATALOG_FILTER_FOLLOWING_ONLY | typeof CATALOG_FILTER_AUCTION_ONLY}
 */
export function isCatalogFilterSelectValue(value) {
  return (
    value === CATALOG_FILTER_FOLLOWING_ONLY ||
    value === CATALOG_FILTER_AUCTION_ONLY
  );
}
