import {
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_OPTIONS,
  PRODUCT_CATEGORIES,
} from "../model/productConstants.js";

export const CATALOG_QUERY_PARAM_SORT = "sort";
export const CATALOG_QUERY_PARAM_CATEGORY = "category";
export const CATALOG_QUERY_PARAM_CATEGORY_ID = "categoryId";
export const CATALOG_QUERY_PARAM_FOLLOWING_ONLY = "followingOnly";
export const CATALOG_QUERY_PARAM_AUCTION_ONLY = "auctionOnly";
export const CATALOG_QUERY_PARAM_INSTALLMENT_ONLY = "installmentOnly";
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
 * @returns {import("../model/types.js").ProductCategory | null}
 */
const parseCatalogCategory = (raw) => {
  if (raw && PRODUCT_CATEGORIES.includes(raw)) {
    return raw;
  }
  return null;
};

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
const parseCatalogCategoryId = (raw) => {
  const value = raw?.trim();
  if (!value || !/^[a-f\d]{24}$/i.test(value)) {
    return null;
  }
  return value;
};

/**
 * @param {URLSearchParams} searchParams
 */
export function parseCatalogQueryFromSearchParams(searchParams) {
  const sort = parseCatalogSort(searchParams.get(CATALOG_QUERY_PARAM_SORT));
  const category = parseCatalogCategory(searchParams.get(CATALOG_QUERY_PARAM_CATEGORY));
  const followingOnly = searchParams.get(CATALOG_QUERY_PARAM_FOLLOWING_ONLY) === "true";
  const auctionOnly = searchParams.get(CATALOG_QUERY_PARAM_AUCTION_ONLY) === "true";
  const installmentOnly =
    searchParams.get(CATALOG_QUERY_PARAM_INSTALLMENT_ONLY) === "true";
  const saleOnly = searchParams.get(CATALOG_QUERY_PARAM_SALE_ONLY) === "true";

  const categoryId = parseCatalogCategoryId(
    searchParams.get(CATALOG_QUERY_PARAM_CATEGORY_ID),
  );

  return {
    sort,
    category: categoryId ? null : category,
    categoryId,
    followingOnly,
    auctionOnly,
    installmentOnly,
    saleOnly,
  };
}

/**
 * @param {{
 *   sort: string;
 *   category: import("../model/types.js").ProductCategory | null;
 *   categoryId: string | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 * }}
 */
export function buildCatalogSearchParams({
  sort,
  category,
  categoryId,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
}) {
  const params = new URLSearchParams();

  if (sort !== CATALOG_SORT_NEWEST) {
    params.set(CATALOG_QUERY_PARAM_SORT, sort);
  }
  if (categoryId) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY_ID, categoryId);
  } else if (category) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY, category);
  }
  if (followingOnly) {
    params.set(CATALOG_QUERY_PARAM_FOLLOWING_ONLY, "true");
  }
  if (auctionOnly) {
    params.set(CATALOG_QUERY_PARAM_AUCTION_ONLY, "true");
  }
  if (installmentOnly) {
    params.set(CATALOG_QUERY_PARAM_INSTALLMENT_ONLY, "true");
  }
  if (saleOnly) {
    params.set(CATALOG_QUERY_PARAM_SALE_ONLY, "true");
  }

  return params;
}

/**
 * Query для `/catalog`.
 * По умолчанию `sort=newest` не пишется — лендинг (`/catalog` без query).
 * `omitDefaultSort: false` — явная лента «Новинки» (`/catalog?sort=newest`).
 *
 * @param {{
 *   sort: string;
 *   category: import("../model/types.js").ProductCategory | null;
 *   categoryId: string | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 * }} query
 * @param {{ omitDefaultSort?: boolean }} [options]
 */
export function buildCatalogBrowserSearchParams(
  { sort, category, categoryId, followingOnly, auctionOnly, installmentOnly, saleOnly },
  { omitDefaultSort = true } = {},
) {
  const params = new URLSearchParams();

  if (sort !== CATALOG_SORT_NEWEST || !omitDefaultSort) {
    params.set(CATALOG_QUERY_PARAM_SORT, sort);
  }

  if (categoryId) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY_ID, categoryId);
  } else if (category) {
    params.set(CATALOG_QUERY_PARAM_CATEGORY, category);
  }
  if (followingOnly) {
    params.set(CATALOG_QUERY_PARAM_FOLLOWING_ONLY, "true");
  }
  if (auctionOnly) {
    params.set(CATALOG_QUERY_PARAM_AUCTION_ONLY, "true");
  }
  if (installmentOnly) {
    params.set(CATALOG_QUERY_PARAM_INSTALLMENT_ONLY, "true");
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
