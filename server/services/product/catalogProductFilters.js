import {
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
  PRODUCT_CATALOG_DELIVERY_FILTER_VALUES,
  PRODUCT_CATALOG_RATING_MIN_VALUES,
  PRODUCT_DELIVERY_CARRIERS,
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_PRICE_RUB_MAX,
} from "@molha/api-contract";
import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT,
  PRODUCT_SORT_CONFIRMED,
  PRODUCT_SORT_PREMIUM,
  PRODUCT_SORT_REVIEWS,
} from "../../constants/productCatalogSort.js";
import { SellerPersonalCategoryModel } from "../../models/index.js";
import { getHiddenSellerIds, isUserStaff } from "../access/adminUserGuard.js";
import { getVisibleFollowingSellerIds } from "../user/userFollowHelpers.js";
import { getConfirmedSellerIds } from "./confirmedSellerCatalog.js";
import {
  mergeProductCatalogCategoryFilter,
  parseCategoryIdFromQuery,
} from "./mergeProductCatalogCategoryFilter.js";
import {
  filterSellerIdsExcludingHidden,
  getPremiumSellerIds,
} from "./premiumSellerCatalog.js";
import { buildProductSaleOnlyMatch } from "./productDiscount.js";
import { buildProductFlashSaleActiveCatalogMatch } from "./productFlashSaleExpiry.js";
import { categoryFromQuery, parseTruthyQueryFlag } from "./productListQueryHelpers.js";

/**
 * Фильтры публичного каталога — одно место и для выдачи (GET /product), и
 * для счётчиков (GET /product/facets). Каждый фильтр — отдельное условие
 * `{ key, clause }`, условия складываются через `$and`. Так фасеты могут
 * подменить одно условие (цену, способ получения) и посчитать ровно то, что
 * покупатель получит в выдаче.
 */

/** Флаги «только …», у каждого одно условие без параметров. */
export const CATALOG_TOGGLE_FILTER_KEYS = [
  "auctionOnly",
  "installmentOnly",
  "saleOnly",
  "rentalOnly",
  "affiliateOnly",
  "wholesaleOnly",
  "buyNFreeOnly",
  "originalOnly",
  "flashSaleOnly",
  "pickupOnly",
  "returnOnly",
];

/** Службы доставки — всё, что не продавец и не курьеры Gitorg. */
const CARRIER_SERVICE_VALUES = PRODUCT_DELIVERY_CARRIERS.filter(
  (carrier) =>
    carrier !== PRODUCT_DELIVERY_CARRIER_SELLER &&
    carrier !== PRODUCT_DELIVERY_CARRIER_GITORG,
);

/** Поле перевозчика не заполнено — товар создан до его появления. */
const LEGACY_CARRIER_UNSET = {
  productDeliveryCarrier: { $nin: PRODUCT_DELIVERY_CARRIERS },
};

/**
 * Совпадает с `resolveProductDeliveryCarrier`: явное поле, иначе старые флаги
 * (курьерский проверяется первым).
 */
const DELIVERY_FILTER_MATCHERS = {
  seller: () => ({
    $or: [
      { productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_SELLER },
      {
        ...LEGACY_CARRIER_UNSET,
        productDeliveryEnabled: true,
        productCourierDeliveryEnabled: { $ne: true },
      },
    ],
  }),
  courier: () => ({
    $or: [
      { productDeliveryCarrier: PRODUCT_DELIVERY_CARRIER_GITORG },
      { ...LEGACY_CARRIER_UNSET, productCourierDeliveryEnabled: true },
    ],
  }),
  carrier: () => ({ productDeliveryCarrier: { $in: CARRIER_SERVICE_VALUES } }),
};

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
const parsePriceRub = (raw) => {
  if (raw == null || String(raw).trim() === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= PRODUCT_PRICE_RUB_MAX
    ? value
    : null;
};

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
const parseRatingMin = (raw) => {
  const value = Number(raw);
  return PRODUCT_CATALOG_RATING_MIN_VALUES.includes(value) ? value : null;
};

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export const parseCatalogDeliveryFilter = (raw) => {
  if (raw == null) {
    return [];
  }
  const parts = (Array.isArray(raw) ? raw : [raw])
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim());
  return [
    ...new Set(
      parts.filter((item) => PRODUCT_CATALOG_DELIVERY_FILTER_VALUES.includes(item)),
    ),
  ];
};

/**
 * @param {Record<string, unknown>} query
 */
export function parseCatalogFilters(query) {
  const sort = query?.sort;
  return {
    categoryId: parseCategoryIdFromQuery(query.categoryId),
    productCategory: categoryFromQuery(query),
    sellerPersonalCategoryId: parseCategoryIdFromQuery(query.sellerPersonalCategoryId),
    includeHidden: parseTruthyQueryFlag(query.includeHidden),
    near: parseTruthyQueryFlag(query.near),
    followingOnly: parseTruthyQueryFlag(query.followingOnly),
    // Старые ссылки: sort=premium / confirmed / reviews означали те же фильтры.
    sellerPremium:
      parseTruthyQueryFlag(query.sellerPremium) || sort === PRODUCT_SORT_PREMIUM,
    sellerConfirmed:
      parseTruthyQueryFlag(query.sellerConfirmed) || sort === PRODUCT_SORT_CONFIRMED,
    withReviews:
      parseTruthyQueryFlag(query.withReviews) || sort === PRODUCT_SORT_REVIEWS,
    ratingMin: parseRatingMin(query.ratingMin),
    priceMin: parsePriceRub(query.priceMin),
    priceMax: parsePriceRub(query.priceMax),
    delivery: parseCatalogDeliveryFilter(query.delivery),
    toggles: Object.fromEntries(
      CATALOG_TOGGLE_FILTER_KEYS.map((key) => [key, parseTruthyQueryFlag(query[key])]),
    ),
  };
}

/** @typedef {ReturnType<typeof parseCatalogFilters>} CatalogFilters */

/**
 * @param {string} key один из CATALOG_TOGGLE_FILTER_KEYS
 * @returns {Record<string, unknown>}
 */
export function buildCatalogToggleClause(key) {
  switch (key) {
    case "auctionOnly":
      return { productAuctionEnabled: true };
    case "installmentOnly":
      return { productInstallmentEnabled: true };
    case "saleOnly":
      return buildProductSaleOnlyMatch();
    case "rentalOnly":
      return { productRentalEnabled: true };
    case "affiliateOnly":
      return { affiliateEnabled: true };
    case "wholesaleOnly":
      return { productWholesaleEnabled: true };
    case "buyNFreeOnly":
      return {
        productBuyNFreeEnabled: true,
        productBuyNFreeThreshold: {
          $gte: PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
          $lte: PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
        },
      };
    case "originalOnly":
      return { productIsOriginal: true };
    case "flashSaleOnly":
      return buildProductFlashSaleActiveCatalogMatch();
    case "pickupOnly":
      // Как в каталоге «Рядом»: у старых документов поля нет — самовывоз включён.
      return { productPickupEnabled: { $ne: false } };
    case "returnOnly":
      return { productReturnEnabled: true };
    default:
      throw new Error(`Unknown catalog toggle filter: ${key}`);
  }
}

export const buildCatalogWithReviewsClause = () => ({
  reviewCount: { $gte: PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT },
});

/**
 * @param {number} ratingMin
 */
export const buildCatalogRatingClause = (ratingMin) => ({
  averageRating: { $gte: ratingMin },
  reviewCount: { $gte: PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT },
});

/**
 * @param {number | null} priceMin
 * @param {number | null} priceMax
 */
export const buildCatalogPriceClause = (priceMin, priceMax) => {
  if (priceMin == null && priceMax == null) {
    return null;
  }
  return {
    productPrice: {
      ...(priceMin != null ? { $gte: priceMin } : {}),
      ...(priceMax != null ? { $lte: priceMax } : {}),
    },
  };
};

/**
 * @param {string[]} delivery
 */
export const buildCatalogDeliveryClause = (delivery) => {
  if (delivery.length === 0) {
    return null;
  }
  const matchers = delivery.map((value) => DELIVERY_FILTER_MATCHERS[value]());
  return matchers.length === 1 ? matchers[0] : { $or: matchers };
};

/**
 * @param {unknown[] | null | undefined} sellerIds
 */
export const buildSellerSetClause = (sellerIds) => ({
  productSeller: { $in: sellerIds ?? [] },
});

/**
 * @param {string | null} sellerPersonalCategoryId
 */
const isSellerPersonalCategoryActive = async (sellerPersonalCategoryId) => {
  if (!sellerPersonalCategoryId) {
    return true;
  }
  const personalCategory = await SellerPersonalCategoryModel.findById(
    sellerPersonalCategoryId,
  )
    .select("activeUntil")
    .lean();
  return (
    Boolean(personalCategory?.activeUntil) &&
    new Date(personalCategory.activeUntil).getTime() > Date.now()
  );
};

/**
 * Данные из базы, нужные условиям фильтров. Фасетам нужны все наборы
 * продавцов сразу — счётчики «Подтверждённые» и «Премиум» считаются, даже
 * когда эти фильтры выключены.
 *
 * @param {{
 *   userId?: string;
 *   filters: CatalogFilters;
 *   includeAllSellerSets?: boolean;
 * }} input
 */
export async function loadCatalogFilterContext({
  userId,
  filters,
  includeAllSellerSets = false,
}) {
  const [hiddenSellerIds, isStaff] = await Promise.all([
    getHiddenSellerIds(),
    isUserStaff(userId),
  ]);

  const wantPremium = includeAllSellerSets || filters.sellerPremium;
  const wantConfirmed = includeAllSellerSets || filters.sellerConfirmed;
  const wantFollowing =
    Boolean(userId) && (includeAllSellerSets || filters.followingOnly);

  const [
    premiumSellerIds,
    confirmedSellerIds,
    followingSellerIds,
    categoryQuery,
    personalCategoryActive,
  ] = await Promise.all([
    wantPremium
      ? getPremiumSellerIds().then((ids) =>
          filterSellerIdsExcludingHidden(ids, hiddenSellerIds),
        )
      : null,
    wantConfirmed
      ? getConfirmedSellerIds().then((ids) =>
          filterSellerIdsExcludingHidden(ids, hiddenSellerIds),
        )
      : null,
    wantFollowing ? getVisibleFollowingSellerIds(String(userId)) : null,
    mergeProductCatalogCategoryFilter(
      {},
      { categoryId: filters.categoryId, productCategory: filters.productCategory },
    ),
    isSellerPersonalCategoryActive(filters.sellerPersonalCategoryId),
  ]);

  return {
    isStaff,
    includeHiddenStaff: isStaff && filters.includeHidden,
    hiddenSellerIds,
    premiumSellerIds,
    confirmedSellerIds,
    followingSellerIds,
    categoryQuery,
    personalCategoryActive,
  };
}

/** @typedef {Awaited<ReturnType<typeof loadCatalogFilterContext>>} CatalogFilterContext */

/**
 * @typedef {{ key: string; clause: Record<string, unknown> }} CatalogFilterClause
 */

/**
 * @param {CatalogFilters} filters
 * @param {CatalogFilterContext} context
 * @returns {CatalogFilterClause[] | null} null — выдача заведомо пуста
 */
export function buildCatalogFilterClauses(filters, context) {
  if (!context.personalCategoryActive) {
    return null;
  }

  /** @type {CatalogFilterClause[]} */
  const clauses = [
    {
      key: "moderation",
      clause: { productModerationStatus: PRODUCT_MODERATION_APPROVED },
    },
  ];
  /**
   * @param {string} key
   * @param {Record<string, unknown> | null} clause
   */
  const add = (key, clause) => {
    if (clause) {
      clauses.push({ key, clause });
    }
  };

  if (Object.keys(context.categoryQuery).length > 0) {
    add("category", context.categoryQuery);
  }
  if (filters.sellerPersonalCategoryId) {
    add("sellerPersonalCategory", {
      sellerPersonalCategoryId: new mongoose.Types.ObjectId(
        filters.sellerPersonalCategoryId,
      ),
    });
  }
  if (!context.includeHiddenStaff) {
    add("availability", { productIsAvailable: { $ne: false } });
    add("stock", {
      $or: [{ productOutOfStock: true }, { productStockQuantity: { $gt: 0 } }],
    });
  }
  if (context.hiddenSellerIds.length > 0) {
    add("hiddenSellers", { productSeller: { $nin: context.hiddenSellerIds } });
  }
  if (filters.sellerPremium) {
    add("sellerPremium", buildSellerSetClause(context.premiumSellerIds));
  }
  if (filters.sellerConfirmed) {
    add("sellerConfirmed", buildSellerSetClause(context.confirmedSellerIds));
  }
  if (filters.followingOnly) {
    add("followingOnly", buildSellerSetClause(context.followingSellerIds));
  }
  for (const key of CATALOG_TOGGLE_FILTER_KEYS) {
    if (filters.toggles[key]) {
      add(key, buildCatalogToggleClause(key));
    }
  }
  if (filters.withReviews) {
    add("withReviews", buildCatalogWithReviewsClause());
  }
  if (filters.ratingMin != null) {
    add("ratingMin", buildCatalogRatingClause(filters.ratingMin));
  }
  add("price", buildCatalogPriceClause(filters.priceMin, filters.priceMax));
  add("delivery", buildCatalogDeliveryClause(filters.delivery));

  return clauses;
}

/**
 * @param {CatalogFilterClause[]} clauses
 */
export const mergeCatalogFilterClauses = (clauses) => ({
  $and: clauses.map((item) => item.clause),
});

/**
 * Фильтр по набору продавцов, а набор пуст: выдача пустая без запроса к базе.
 *
 * @param {CatalogFilters} filters
 * @param {CatalogFilterContext} context
 */
export const isCatalogSellerSetEmpty = (filters, context) =>
  (filters.sellerPremium && !context.premiumSellerIds?.length) ||
  (filters.sellerConfirmed && !context.confirmedSellerIds?.length) ||
  (filters.followingOnly && !context.followingSellerIds?.length);
