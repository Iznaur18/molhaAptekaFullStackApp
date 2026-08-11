import {
  CATALOG_FILTER_AFFILIATE_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_ORIGINAL_ONLY,
  CATALOG_FILTER_RENTAL_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_FILTER_WHOLESALE_ONLY,
  CATALOG_SORT_NEWEST,
} from "../../product/model/productConstants.js";

/**
 * @returns {{
 *   sort: string;
 *   category: null;
 *   categoryId: null;
 *   sellerPersonalCategoryId: null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 *   rentalOnly: boolean;
 *   affiliateOnly: boolean;
 *   wholesaleOnly: boolean;
 *   originalOnly: boolean;
 *   near: boolean;
 * }}
 */
const baseFeedQuery = () => ({
  sort: CATALOG_SORT_NEWEST,
  category: null,
  categoryId: null,
  sellerPersonalCategoryId: null,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
  rentalOnly: false,
  affiliateOnly: false,
  wholesaleOnly: false,
  originalOnly: false,
  near: false,
});

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 */
export function buildQueryForCatalogFeedTile(tile) {
  if (tile.kind === "sort") {
    return {
      ...baseFeedQuery(),
      sort: tile.value,
    };
  }

  if (tile.value === CATALOG_FILTER_NEAR) {
    return { ...baseFeedQuery(), near: true };
  }

  if (tile.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return { ...baseFeedQuery(), followingOnly: true };
  }

  if (tile.value === CATALOG_FILTER_AUCTION_ONLY) {
    return { ...baseFeedQuery(), auctionOnly: true };
  }

  if (tile.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
    return { ...baseFeedQuery(), installmentOnly: true };
  }

  if (tile.value === CATALOG_FILTER_SALE_ONLY) {
    return { ...baseFeedQuery(), saleOnly: true };
  }

  if (tile.value === CATALOG_FILTER_RENTAL_ONLY) {
    return { ...baseFeedQuery(), rentalOnly: true };
  }

  if (tile.value === CATALOG_FILTER_AFFILIATE_ONLY) {
    return { ...baseFeedQuery(), affiliateOnly: true };
  }

  if (tile.value === CATALOG_FILTER_WHOLESALE_ONLY) {
    return { ...baseFeedQuery(), wholesaleOnly: true };
  }

  if (tile.value === CATALOG_FILTER_ORIGINAL_ONLY) {
    return { ...baseFeedQuery(), originalOnly: true };
  }

  return baseFeedQuery();
}

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 * @param {string} sort
 * @param {boolean} followingOnly
 * @param {boolean} auctionOnly
 * @param {boolean} installmentOnly
 * @param {boolean} saleOnly
 * @param {boolean} [near]
 * @param {boolean} [rentalOnly]
 * @param {boolean} [affiliateOnly]
 * @param {boolean} [wholesaleOnly]
 * @param {boolean} [originalOnly]
 */
export function isCatalogFeedTileActive(
  tile,
  sort,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  near = false,
  rentalOnly = false,
  affiliateOnly = false,
  wholesaleOnly = false,
  originalOnly = false,
) {
  if (tile.kind === "sort") {
    return (
      sort === tile.value &&
      !followingOnly &&
      !auctionOnly &&
      !installmentOnly &&
      !saleOnly &&
      !rentalOnly &&
      !affiliateOnly &&
      !wholesaleOnly &&
      !originalOnly &&
      !near
    );
  }

  if (tile.value === CATALOG_FILTER_NEAR) {
    return near;
  }

  if (tile.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return followingOnly;
  }

  if (tile.value === CATALOG_FILTER_AUCTION_ONLY) {
    return auctionOnly;
  }

  if (tile.value === CATALOG_FILTER_INSTALLMENT_ONLY) {
    return installmentOnly;
  }

  if (tile.value === CATALOG_FILTER_SALE_ONLY) {
    return saleOnly;
  }

  if (tile.value === CATALOG_FILTER_RENTAL_ONLY) {
    return rentalOnly;
  }

  if (tile.value === CATALOG_FILTER_AFFILIATE_ONLY) {
    return affiliateOnly;
  }

  if (tile.value === CATALOG_FILTER_WHOLESALE_ONLY) {
    return wholesaleOnly;
  }

  if (tile.value === CATALOG_FILTER_ORIGINAL_ONLY) {
    return originalOnly;
  }

  return false;
}
