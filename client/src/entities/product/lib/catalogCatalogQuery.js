import {
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_OPTIONS,
  CATALOG_SORT_REVIEWS,
  PRODUCT_CATEGORIES,
} from "../model/productConstants.js";

export const CATALOG_QUERY_PARAM_SORT = "sort";
export const CATALOG_QUERY_PARAM_CATEGORY = "category";
export const CATALOG_QUERY_PARAM_CATEGORY_ID = "categoryId";
export const CATALOG_QUERY_PARAM_FOLLOWING_ONLY = "followingOnly";
export const CATALOG_QUERY_PARAM_AUCTION_ONLY = "auctionOnly";
export const CATALOG_QUERY_PARAM_INSTALLMENT_ONLY = "installmentOnly";
export const CATALOG_QUERY_PARAM_SALE_ONLY = "saleOnly";
export const CATALOG_QUERY_PARAM_RENTAL_ONLY = "rentalOnly";
export const CATALOG_QUERY_PARAM_AFFILIATE_ONLY = "affiliateOnly";
export const CATALOG_QUERY_PARAM_WHOLESALE_ONLY = "wholesaleOnly";
export const CATALOG_QUERY_PARAM_BUY_N_FREE_ONLY = "buyNFreeOnly";
export const CATALOG_QUERY_PARAM_ORIGINAL_ONLY = "originalOnly";
export const CATALOG_QUERY_PARAM_NEAR = "near";
export const CATALOG_QUERY_PARAM_FLASH_SALE_ONLY = "flashSaleOnly";
export const CATALOG_QUERY_PARAM_SELLER_PERSONAL_CATEGORY_ID =
  "sellerPersonalCategoryId";

/**
 * @param {string | null | undefined} raw
 */
const parseCatalogSort = (raw) => {
  if (
    raw &&
    (CATALOG_SORT_OPTIONS.includes(raw) || raw === CATALOG_SORT_REVIEWS)
  ) {
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
  const rentalOnly = searchParams.get(CATALOG_QUERY_PARAM_RENTAL_ONLY) === "true";
  const affiliateOnly =
    searchParams.get(CATALOG_QUERY_PARAM_AFFILIATE_ONLY) === "true";
  const wholesaleOnly =
    searchParams.get(CATALOG_QUERY_PARAM_WHOLESALE_ONLY) === "true";
  const buyNFreeOnly =
    searchParams.get(CATALOG_QUERY_PARAM_BUY_N_FREE_ONLY) === "true";
  const originalOnly =
    searchParams.get(CATALOG_QUERY_PARAM_ORIGINAL_ONLY) === "true";
  const near = searchParams.get(CATALOG_QUERY_PARAM_NEAR) === "true";
  const flashSaleOnly =
    searchParams.get(CATALOG_QUERY_PARAM_FLASH_SALE_ONLY) === "true";

  const categoryId = parseCatalogCategoryId(
    searchParams.get(CATALOG_QUERY_PARAM_CATEGORY_ID),
  );
  const sellerPersonalCategoryId = parseCatalogCategoryId(
    searchParams.get(CATALOG_QUERY_PARAM_SELLER_PERSONAL_CATEGORY_ID),
  );

  return {
    sort,
    category: categoryId || sellerPersonalCategoryId ? null : category,
    categoryId,
    sellerPersonalCategoryId,
    followingOnly,
    auctionOnly,
    installmentOnly,
    saleOnly,
    rentalOnly,
    affiliateOnly,
    wholesaleOnly,
    buyNFreeOnly,
    originalOnly,
    near,
    flashSaleOnly,
  };
}

/**
 * @param {{
 *   sort: string;
 *   category: import("../model/types.js").ProductCategory | null;
 *   categoryId: string | null;
 *   sellerPersonalCategoryId: string | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 *   rentalOnly: boolean;
 *   affiliateOnly: boolean;
 *   wholesaleOnly: boolean;
 *   buyNFreeOnly: boolean;
 *   originalOnly: boolean;
 *   near: boolean;
 * }}
 */
export function buildCatalogSearchParams({
  sort,
  category,
  categoryId,
  sellerPersonalCategoryId,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  rentalOnly,
  affiliateOnly,
  wholesaleOnly,
  buyNFreeOnly,
  originalOnly,
  near,
  flashSaleOnly,
}) {
  const params = new URLSearchParams();

  if (sort !== CATALOG_SORT_NEWEST) {
    params.set(CATALOG_QUERY_PARAM_SORT, sort);
  }
  if (sellerPersonalCategoryId) {
    params.set(
      CATALOG_QUERY_PARAM_SELLER_PERSONAL_CATEGORY_ID,
      sellerPersonalCategoryId,
    );
  } else if (categoryId) {
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
  if (rentalOnly) {
    params.set(CATALOG_QUERY_PARAM_RENTAL_ONLY, "true");
  }
  if (affiliateOnly) {
    params.set(CATALOG_QUERY_PARAM_AFFILIATE_ONLY, "true");
  }
  if (wholesaleOnly) {
    params.set(CATALOG_QUERY_PARAM_WHOLESALE_ONLY, "true");
  }
  if (buyNFreeOnly) {
    params.set(CATALOG_QUERY_PARAM_BUY_N_FREE_ONLY, "true");
  }
  if (originalOnly) {
    params.set(CATALOG_QUERY_PARAM_ORIGINAL_ONLY, "true");
  }
  if (near) {
    params.set(CATALOG_QUERY_PARAM_NEAR, "true");
  }
  if (flashSaleOnly) {
    params.set(CATALOG_QUERY_PARAM_FLASH_SALE_ONLY, "true");
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
 *   sellerPersonalCategoryId: string | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly: boolean;
 *   saleOnly: boolean;
 *   rentalOnly: boolean;
 *   affiliateOnly: boolean;
 *   wholesaleOnly: boolean;
 *   buyNFreeOnly: boolean;
 *   originalOnly: boolean;
 *   near: boolean;
 * }} query
 * @param {{ omitDefaultSort?: boolean }} [options]
 */
export function buildCatalogBrowserSearchParams(
  {
    sort,
    category,
    categoryId,
    sellerPersonalCategoryId,
    followingOnly,
    auctionOnly,
    installmentOnly,
    saleOnly,
    rentalOnly,
    affiliateOnly,
    wholesaleOnly,
    buyNFreeOnly,
    originalOnly,
    near,
    flashSaleOnly,
  },
  { omitDefaultSort = true } = {},
) {
  const params = new URLSearchParams();

  if (sort !== CATALOG_SORT_NEWEST || !omitDefaultSort) {
    params.set(CATALOG_QUERY_PARAM_SORT, sort);
  }

  if (sellerPersonalCategoryId) {
    params.set(
      CATALOG_QUERY_PARAM_SELLER_PERSONAL_CATEGORY_ID,
      sellerPersonalCategoryId,
    );
  } else if (categoryId) {
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
  if (rentalOnly) {
    params.set(CATALOG_QUERY_PARAM_RENTAL_ONLY, "true");
  }
  if (affiliateOnly) {
    params.set(CATALOG_QUERY_PARAM_AFFILIATE_ONLY, "true");
  }
  if (wholesaleOnly) {
    params.set(CATALOG_QUERY_PARAM_WHOLESALE_ONLY, "true");
  }
  if (buyNFreeOnly) {
    params.set(CATALOG_QUERY_PARAM_BUY_N_FREE_ONLY, "true");
  }
  if (originalOnly) {
    params.set(CATALOG_QUERY_PARAM_ORIGINAL_ONLY, "true");
  }
  if (near) {
    params.set(CATALOG_QUERY_PARAM_NEAR, "true");
  }
  if (flashSaleOnly) {
    params.set(CATALOG_QUERY_PARAM_FLASH_SALE_ONLY, "true");
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
