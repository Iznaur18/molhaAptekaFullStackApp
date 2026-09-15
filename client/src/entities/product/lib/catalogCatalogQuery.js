import {
  PRODUCT_CATALOG_DELIVERY_FILTER_VALUES,
  PRODUCT_CATALOG_RATING_MIN_VALUES,
  PRODUCT_CATALOG_SORT_VALUES,
  PRODUCT_PRICE_RUB_MAX,
} from "@molha/api-contract";

import { CATALOG_SORT_NEWEST, PRODUCT_CATEGORIES } from "../model/productConstants.js";

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
export const CATALOG_QUERY_PARAM_PRICE_MIN = "priceMin";
export const CATALOG_QUERY_PARAM_PRICE_MAX = "priceMax";
export const CATALOG_QUERY_PARAM_DELIVERY = "delivery";
export const CATALOG_QUERY_PARAM_PICKUP_ONLY = "pickupOnly";
export const CATALOG_QUERY_PARAM_RATING_MIN = "ratingMin";
export const CATALOG_QUERY_PARAM_WITH_REVIEWS = "withReviews";
export const CATALOG_QUERY_PARAM_RETURN_ONLY = "returnOnly";
export const CATALOG_QUERY_PARAM_SELLER_CONFIRMED = "sellerConfirmed";
export const CATALOG_QUERY_PARAM_SELLER_PREMIUM = "sellerPremium";

/** Параметры окна «Фильтры»: цена, получение, рейтинг, продавец. */
export const CATALOG_EXTRA_FILTER_QUERY_PARAMS = [
  CATALOG_QUERY_PARAM_PRICE_MIN,
  CATALOG_QUERY_PARAM_PRICE_MAX,
  CATALOG_QUERY_PARAM_DELIVERY,
  CATALOG_QUERY_PARAM_PICKUP_ONLY,
  CATALOG_QUERY_PARAM_RATING_MIN,
  CATALOG_QUERY_PARAM_WITH_REVIEWS,
  CATALOG_QUERY_PARAM_RETURN_ONLY,
  CATALOG_QUERY_PARAM_SELLER_CONFIRMED,
  CATALOG_QUERY_PARAM_SELLER_PREMIUM,
];

/**
 * @typedef {{
 *   priceMin: number | null;
 *   priceMax: number | null;
 *   delivery: string[];
 *   pickupOnly: boolean;
 *   ratingMin: number | null;
 *   withReviews: boolean;
 *   returnOnly: boolean;
 *   sellerConfirmed: boolean;
 *   sellerPremium: boolean;
 * }} CatalogExtraFilters
 */

/** @type {Readonly<CatalogExtraFilters>} */
export const EMPTY_CATALOG_EXTRA_FILTERS = Object.freeze({
  priceMin: null,
  priceMax: null,
  delivery: /** @type {string[]} */ (Object.freeze([])),
  pickupOnly: false,
  ratingMin: null,
  withReviews: false,
  returnOnly: false,
  sellerConfirmed: false,
  sellerPremium: false,
});

/**
 * @param {string | null | undefined} raw
 */
const parseCatalogSort = (raw) => {
  if (raw && PRODUCT_CATALOG_SORT_VALUES.includes(raw)) {
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
 * @param {unknown} value
 * @returns {number | null}
 */
const toCatalogPriceFilter = (value) =>
  Number.isInteger(value) &&
  /** @type {number} */ (value) >= 0 &&
  /** @type {number} */ (value) <= PRODUCT_PRICE_RUB_MAX
    ? /** @type {number} */ (value)
    : null;

/**
 * @param {string | null} raw
 */
const parseCatalogPriceParam = (raw) => {
  const value = raw?.trim();
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }
  return toCatalogPriceFilter(Number(value));
};

/**
 * «От» больше «до» — меняем местами: сервер на такой диапазон отвечает 400.
 *
 * @param {number | null} priceMin
 * @param {number | null} priceMax
 * @returns {[number | null, number | null]}
 */
export function normalizeCatalogPriceRange(priceMin, priceMax) {
  if (priceMin != null && priceMax != null && priceMin > priceMax) {
    return [priceMax, priceMin];
  }
  return [priceMin, priceMax];
}

/**
 * Без дублей и неизвестных значений, в порядке контракта — чтобы адрес
 * и ключ запроса не зависели от порядка нажатий.
 *
 * @param {readonly unknown[]} values
 * @returns {string[]}
 */
export function normalizeCatalogDeliveryFilter(values) {
  return PRODUCT_CATALOG_DELIVERY_FILTER_VALUES.filter((value) =>
    values.includes(value),
  );
}

/**
 * @param {Partial<CatalogExtraFilters> | null | undefined} query
 * @returns {CatalogExtraFilters}
 */
export function pickCatalogExtraFilters(query) {
  const [priceMin, priceMax] = normalizeCatalogPriceRange(
    toCatalogPriceFilter(query?.priceMin),
    toCatalogPriceFilter(query?.priceMax),
  );
  const ratingMin = Number(query?.ratingMin);
  return {
    priceMin,
    priceMax,
    delivery: normalizeCatalogDeliveryFilter(
      Array.isArray(query?.delivery) ? query.delivery : [],
    ),
    pickupOnly: query?.pickupOnly === true,
    ratingMin:
      query?.ratingMin != null && PRODUCT_CATALOG_RATING_MIN_VALUES.includes(ratingMin)
        ? ratingMin
        : null,
    withReviews: query?.withReviews === true,
    returnOnly: query?.returnOnly === true,
    sellerConfirmed: query?.sellerConfirmed === true,
    sellerPremium: query?.sellerPremium === true,
  };
}

/**
 * @param {CatalogExtraFilters} a
 * @param {CatalogExtraFilters} b
 */
export function areCatalogExtraFiltersEqual(a, b) {
  return (
    a.priceMin === b.priceMin &&
    a.priceMax === b.priceMax &&
    a.delivery.join(",") === b.delivery.join(",") &&
    a.pickupOnly === b.pickupOnly &&
    a.ratingMin === b.ratingMin &&
    a.withReviews === b.withReviews &&
    a.returnOnly === b.returnOnly &&
    a.sellerConfirmed === b.sellerConfirmed &&
    a.sellerPremium === b.sellerPremium
  );
}

/**
 * @param {Partial<CatalogExtraFilters> | null | undefined} query
 */
export function hasCatalogExtraFilters(query) {
  return !areCatalogExtraFiltersEqual(
    pickCatalogExtraFilters(query),
    EMPTY_CATALOG_EXTRA_FILTERS,
  );
}

/**
 * @param {URLSearchParams} searchParams
 * @returns {CatalogExtraFilters}
 */
function parseCatalogExtraFiltersFromSearchParams(searchParams) {
  const ratingMin = Number(searchParams.get(CATALOG_QUERY_PARAM_RATING_MIN));
  return pickCatalogExtraFilters({
    priceMin: parseCatalogPriceParam(searchParams.get(CATALOG_QUERY_PARAM_PRICE_MIN)),
    priceMax: parseCatalogPriceParam(searchParams.get(CATALOG_QUERY_PARAM_PRICE_MAX)),
    delivery: searchParams
      .getAll(CATALOG_QUERY_PARAM_DELIVERY)
      .flatMap((value) => value.split(","))
      .map((value) => value.trim()),
    pickupOnly: searchParams.get(CATALOG_QUERY_PARAM_PICKUP_ONLY) === "true",
    ratingMin: searchParams.has(CATALOG_QUERY_PARAM_RATING_MIN) ? ratingMin : null,
    withReviews: searchParams.get(CATALOG_QUERY_PARAM_WITH_REVIEWS) === "true",
    returnOnly: searchParams.get(CATALOG_QUERY_PARAM_RETURN_ONLY) === "true",
    sellerConfirmed: searchParams.get(CATALOG_QUERY_PARAM_SELLER_CONFIRMED) === "true",
    sellerPremium: searchParams.get(CATALOG_QUERY_PARAM_SELLER_PREMIUM) === "true",
  });
}

/**
 * @param {URLSearchParams} params
 * @param {Partial<CatalogExtraFilters>} query
 */
function appendCatalogExtraFilterParams(params, query) {
  const extra = pickCatalogExtraFilters(query);
  if (extra.priceMin != null) {
    params.set(CATALOG_QUERY_PARAM_PRICE_MIN, String(extra.priceMin));
  }
  if (extra.priceMax != null) {
    params.set(CATALOG_QUERY_PARAM_PRICE_MAX, String(extra.priceMax));
  }
  if (extra.delivery.length > 0) {
    params.set(CATALOG_QUERY_PARAM_DELIVERY, extra.delivery.join(","));
  }
  if (extra.pickupOnly) {
    params.set(CATALOG_QUERY_PARAM_PICKUP_ONLY, "true");
  }
  if (extra.ratingMin != null) {
    params.set(CATALOG_QUERY_PARAM_RATING_MIN, String(extra.ratingMin));
  }
  if (extra.withReviews) {
    params.set(CATALOG_QUERY_PARAM_WITH_REVIEWS, "true");
  }
  if (extra.returnOnly) {
    params.set(CATALOG_QUERY_PARAM_RETURN_ONLY, "true");
  }
  if (extra.sellerConfirmed) {
    params.set(CATALOG_QUERY_PARAM_SELLER_CONFIRMED, "true");
  }
  if (extra.sellerPremium) {
    params.set(CATALOG_QUERY_PARAM_SELLER_PREMIUM, "true");
  }
}

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
  const affiliateOnly = searchParams.get(CATALOG_QUERY_PARAM_AFFILIATE_ONLY) === "true";
  const wholesaleOnly = searchParams.get(CATALOG_QUERY_PARAM_WHOLESALE_ONLY) === "true";
  const buyNFreeOnly = searchParams.get(CATALOG_QUERY_PARAM_BUY_N_FREE_ONLY) === "true";
  const originalOnly = searchParams.get(CATALOG_QUERY_PARAM_ORIGINAL_ONLY) === "true";
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
    ...parseCatalogExtraFiltersFromSearchParams(searchParams),
  };
}

/**
 * @typedef {{
 *   sort: string;
 *   category: import("../model/types.js").ProductCategory | null;
 *   categoryId: string | null;
 *   sellerPersonalCategoryId: string | null;
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
 * } & Partial<CatalogExtraFilters>} CatalogQuery
 */

/**
 * @param {CatalogQuery} query
 */
export function buildCatalogSearchParams(query) {
  const {
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
  } = query;
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
  appendCatalogExtraFilterParams(params, query);

  return params;
}

/**
 * Query для `/catalog`.
 * По умолчанию `sort=newest` не пишется — лендинг (`/catalog` без query).
 * `omitDefaultSort: false` — явная лента «Новинки» (`/catalog?sort=newest`).
 *
 * @param {CatalogQuery} query
 * @param {{ omitDefaultSort?: boolean }} [options]
 */
export function buildCatalogBrowserSearchParams(
  query,
  { omitDefaultSort = true } = {},
) {
  const {
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
  } = query;
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
  appendCatalogExtraFilterParams(params, query);

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
