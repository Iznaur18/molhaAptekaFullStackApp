import {
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_SORT_CONFIRMED,
  CATALOG_SORT_LABEL_RU,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_VIEWS,
} from "../../product/model/productConstants.js";

/** @typedef {'sort' | 'filter'} CatalogFeedTileKind */

/**
 * @typedef {Object} CatalogFeedTile
 * @property {string} key
 * @property {CatalogFeedTileKind} kind
 * @property {string} value
 * @property {string} label
 */

/** @type {CatalogFeedTile[]} */
export const CATALOG_FEED_TILES = [
  {
    key: `sort:${CATALOG_SORT_NEWEST}`,
    kind: "sort",
    value: CATALOG_SORT_NEWEST,
    label: CATALOG_SORT_LABEL_RU[CATALOG_SORT_NEWEST],
  },
  {
    key: `sort:${CATALOG_SORT_VIEWS}`,
    kind: "sort",
    value: CATALOG_SORT_VIEWS,
    label: CATALOG_SORT_LABEL_RU[CATALOG_SORT_VIEWS],
  },
  {
    key: `sort:${CATALOG_SORT_PURCHASES}`,
    kind: "sort",
    value: CATALOG_SORT_PURCHASES,
    label: CATALOG_SORT_LABEL_RU[CATALOG_SORT_PURCHASES],
  },
  {
    key: `sort:${CATALOG_SORT_PREMIUM}`,
    kind: "sort",
    value: CATALOG_SORT_PREMIUM,
    label: CATALOG_SORT_LABEL_RU[CATALOG_SORT_PREMIUM],
  },
  {
    key: `sort:${CATALOG_SORT_CONFIRMED}`,
    kind: "sort",
    value: CATALOG_SORT_CONFIRMED,
    label: CATALOG_SORT_LABEL_RU[CATALOG_SORT_CONFIRMED],
  },
  {
    key: `filter:${CATALOG_FILTER_FOLLOWING_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_FOLLOWING_ONLY,
    label: CATALOG_SORT_LABEL_RU[CATALOG_FILTER_FOLLOWING_ONLY],
  },
  {
    key: `filter:${CATALOG_FILTER_AUCTION_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_AUCTION_ONLY,
    label: CATALOG_SORT_LABEL_RU[CATALOG_FILTER_AUCTION_ONLY],
  },
  {
    key: `filter:${CATALOG_FILTER_INSTALLMENT_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_INSTALLMENT_ONLY,
    label: "Рассрочка",
  },
  {
    key: `filter:${CATALOG_FILTER_SALE_ONLY}`,
    kind: "filter",
    value: CATALOG_FILTER_SALE_ONLY,
    label: CATALOG_SORT_LABEL_RU[CATALOG_FILTER_SALE_ONLY],
  },
];
