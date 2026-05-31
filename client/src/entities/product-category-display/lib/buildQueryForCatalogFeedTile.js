import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_VIEWS,
} from "../../product/model/productConstants.js";

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 * @returns {{
 *   sort: string;
 *   category: null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   saleOnly: boolean;
 * }}
 */
export function buildQueryForCatalogFeedTile(tile) {
  if (tile.kind === "sort") {
    return {
      sort: tile.value,
      category: null,
      followingOnly: false,
      auctionOnly: false,
      saleOnly: false,
    };
  }

  if (tile.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return {
      sort: CATALOG_SORT_NEWEST,
      category: null,
      followingOnly: true,
      auctionOnly: false,
      saleOnly: false,
    };
  }

  if (tile.value === CATALOG_FILTER_AUCTION_ONLY) {
    return {
      sort: CATALOG_SORT_NEWEST,
      category: null,
      followingOnly: false,
      auctionOnly: true,
      saleOnly: false,
    };
  }

  if (tile.value === CATALOG_FILTER_SALE_ONLY) {
    return {
      sort: CATALOG_SORT_NEWEST,
      category: null,
      followingOnly: false,
      auctionOnly: false,
      saleOnly: true,
    };
  }

  return {
    sort: CATALOG_SORT_NEWEST,
    category: null,
    followingOnly: false,
    auctionOnly: false,
    saleOnly: false,
  };
}

/**
 * @param {import('./buildCatalogFeedTiles.js').CatalogFeedTile} tile
 * @param {string} sort
 * @param {boolean} followingOnly
 * @param {boolean} auctionOnly
 * @param {boolean} saleOnly
 */
export function isCatalogFeedTileActive(
  tile,
  sort,
  followingOnly,
  auctionOnly,
  saleOnly,
) {
  if (tile.kind === "sort") {
    return (
      sort === tile.value &&
      !followingOnly &&
      !auctionOnly &&
      !saleOnly
    );
  }

  if (tile.value === CATALOG_FILTER_FOLLOWING_ONLY) {
    return followingOnly;
  }

  if (tile.value === CATALOG_FILTER_AUCTION_ONLY) {
    return auctionOnly;
  }

  if (tile.value === CATALOG_FILTER_SALE_ONLY) {
    return saleOnly;
  }

  return false;
}
