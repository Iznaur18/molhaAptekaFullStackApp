import {
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_OPTIONS,
  PRODUCT_CATEGORIES,
} from "../../../entities/product/model/productConstants.js";

export const CATALOG_QUERY_PARAM_SORT = "sort";
export const CATALOG_QUERY_PARAM_CATEGORY = "category";
export const CATALOG_QUERY_PARAM_FOLLOWING_ONLY = "followingOnly";
export const CATALOG_QUERY_PARAM_AUCTION_ONLY = "auctionOnly";
export const CATALOG_QUERY_PARAM_SALE_ONLY = "saleOnly";

/**
 * @param {string | null | undefined} raw
 */
const parseCatalogSort = (raw) => {
  if (raw && CATALOG_SORT_OPTIONS.includes(raw)) {
    return raw;
  }
  return CATALOG_SORT_NEWEST;
};

/**
 * @param {string | null | undefined} raw
 * @returns {import("../../../entities/product/model/types.js").ProductCategory | null}
 */
const parseCatalogCategory = (raw) => {
  if (raw && PRODUCT_CATEGORIES.includes(raw)) {
    return raw;
  }
  return null;
};

/**
 * @param {URLSearchParams} searchParams
 */
export function parseCatalogQueryFromSearchParams(searchParams) {
  const sort = parseCatalogSort(searchParams.get(CATALOG_QUERY_PARAM_SORT));
  const category = parseCatalogCategory(
    searchParams.get(CATALOG_QUERY_PARAM_CATEGORY),
  );
  const followingOnly =
    searchParams.get(CATALOG_QUERY_PARAM_FOLLOWING_ONLY) === "true";
  const auctionOnly =
    searchParams.get(CATALOG_QUERY_PARAM_AUCTION_ONLY) === "true";
  const saleOnly = searchParams.get(CATALOG_QUERY_PARAM_SALE_ONLY) === "true";

  return { sort, category, followingOnly, auctionOnly, saleOnly };
}

/**
 * @param {{
 *   sort: string;
 *   category: import("../../../entities/product/model/types.js").ProductCategory | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   saleOnly: boolean;
 * }}
 */
export function buildCatalogSearchParams({
  sort,
  category,
  followingOnly,
  auctionOnly,
  saleOnly,
}) {
  const params = new URLSearchParams();

  if (sort !== CATALOG_SORT_NEWEST) {
    params.set(CATALOG_QUERY_PARAM_SORT, sort);
  }
  if (category) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY, category);
  }
  if (followingOnly) {
    params.set(CATALOG_QUERY_PARAM_FOLLOWING_ONLY, "true");
  }
  if (auctionOnly) {
    params.set(CATALOG_QUERY_PARAM_AUCTION_ONLY, "true");
  }
  if (saleOnly) {
    params.set(CATALOG_QUERY_PARAM_SALE_ONLY, "true");
  }

  return params;
}

/**
 * Query для `/catalog` с явным `sort` (в т.ч. `newest` для ленты «Новинки»).
 *
 * @param {{
 *   sort: string;
 *   category: import("../../../entities/product/model/types.js").ProductCategory | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   saleOnly: boolean;
 * }} query
 */
export function buildCatalogBrowserSearchParams({
  sort,
  category,
  followingOnly,
  auctionOnly,
  saleOnly,
}) {
  const params = new URLSearchParams();
  params.set(CATALOG_QUERY_PARAM_SORT, sort);

  if (category) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY, category);
  }
  if (followingOnly) {
    params.set(CATALOG_QUERY_PARAM_FOLLOWING_ONLY, "true");
  }
  if (auctionOnly) {
    params.set(CATALOG_QUERY_PARAM_AUCTION_ONLY, "true");
  }
  if (saleOnly) {
    params.set(CATALOG_QUERY_PARAM_SALE_ONLY, "true");
  }

  return params;
}

/**
 * @param {URLSearchParams} a
 * @param {URLSearchParams} b
 */
export function areCatalogSearchParamsEqual(a, b) {
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const key of keys) {
    if (a.get(key) !== b.get(key)) {
      return false;
    }
  }
  return true;
}
