import {
  CATALOG_FILTER_AFFILIATE_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_BUY_N_FREE_ONLY,
  CATALOG_FILTER_FLASH_SALE_ONLY,
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_ORIGINAL_ONLY,
  CATALOG_FILTER_RENTAL_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_FILTER_WHOLESALE_ONLY,
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
 *   rentalOnly?: boolean;
 *   affiliateOnly?: boolean;
 *   wholesaleOnly?: boolean;
 *   buyNFreeOnly?: boolean;
 *   originalOnly?: boolean;
 *   near?: boolean;
 *   flashSaleOnly?: boolean;
 * }} query
 * @returns {string | null}
 */
export function resolveActiveCatalogFeedLabel(query) {
  if (query.flashSaleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_FLASH_SALE_ONLY];
  }
  if (query.near) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_NEAR];
  }
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
  if (query.rentalOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_RENTAL_ONLY];
  }
  if (query.affiliateOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_AFFILIATE_ONLY];
  }
  if (query.wholesaleOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_WHOLESALE_ONLY];
  }
  if (query.buyNFreeOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_BUY_N_FREE_ONLY];
  }
  if (query.originalOnly) {
    return CATALOG_SORT_LABEL_RU[CATALOG_FILTER_ORIGINAL_ONLY];
  }
  if (query.sort === CATALOG_SORT_NEWEST) {
    return CATALOG_SORT_LABEL_RU[CATALOG_SORT_NEWEST];
  }
  return CATALOG_SORT_LABEL_RU[query.sort] ?? null;
}
