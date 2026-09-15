import { USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE } from "../../constants/userFollowConstants.js";
import { getCatalogProductModel } from "../../db/mongoReadConnection.js";
import { AppError } from "../../errors/AppError.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { resolveViewerRegionCodeForRequest } from "../user/userRegionCatalogFilter.js";
import { buildProductCatalogSearchQuery } from "./buildProductCatalogSearchQuery.js";
import {
  CATALOG_TOGGLE_FILTER_KEYS,
  buildCatalogDeliveryClause,
  buildCatalogFilterClauses,
  buildCatalogRatingClause,
  buildCatalogToggleClause,
  buildCatalogWithReviewsClause,
  buildSellerSetClause,
  loadCatalogFilterContext,
  parseCatalogFilters,
} from "./catalogProductFilters.js";
import {
  buildCatalogProductsCacheKey,
  getCachedCatalogProducts,
  setCachedCatalogProducts,
} from "./catalogProductsResponseCache.js";
import {
  buildNearGeoQuery,
  buildNearNoLocationMatch,
  countProductsNear,
} from "./productCatalogNearQuery.js";
import { normalizeProductsQueryForAggregate } from "./productCatalogQuery.js";
import { resolveCatalogNearContext } from "./resolveCatalogNearContext.js";

/** Сколько категорий выдачи отдаём в шторку. */
const FACET_CATEGORY_LIMIT = 8;
/** Порог варианта «Рейтинг 4 и выше». */
const FACET_RATING_MIN = 4;
/**
 * Условия, которые фасеты подставляют сами: цена в статистике не
 * учитывается, способ получения считается объединением с текущим выбором.
 */
const FACET_REPLACED_CLAUSE_KEYS = new Set(["price", "delivery"]);

/**
 * @param {(Record<string, unknown> | null)[]} clauses
 */
const buildFacetMatch = (clauses) => {
  const list = clauses.filter(Boolean);
  if (list.length === 0) {
    return {};
  }
  return normalizeProductsQueryForAggregate(
    list.length === 1 ? list[0] : { $and: list },
  );
};

/**
 * @param {Record<string, unknown>} baseQuery
 * @param {(Record<string, unknown> | null)[]} extraClauses
 */
const withExtraClauses = (baseQuery, extraClauses) => {
  const list = extraClauses.filter(Boolean);
  return list.length === 0 ? baseQuery : { $and: [baseQuery, ...list] };
};

/**
 * @param {number[]} sorted
 * @param {number} quantile
 */
const pickPercentile = (sorted, quantile) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * quantile))];

/**
 * @param {unknown[]} prices
 */
export const summarizeFacetPrices = (prices) => {
  const sorted = prices
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  return {
    min: sorted[0],
    p25: pickPercentile(sorted, 0.25),
    p50: pickPercentile(sorted, 0.5),
    p75: pickPercentile(sorted, 0.75),
    p90: pickPercentile(sorted, 0.9),
    max: sorted[sorted.length - 1],
  };
};

/**
 * @param {{ followingAvailable: boolean; nearAvailable: boolean }} availability
 */
const buildEmptyFacets = ({ followingAvailable, nearAvailable }) => ({
  total: 0,
  price: null,
  categories: [],
  options: {
    delivery: { seller: 0, courier: 0, carrier: 0 },
    pickupOnly: 0,
    ratingMin4: 0,
    withReviews: 0,
    saleOnly: 0,
    flashSaleOnly: 0,
    installmentOnly: 0,
    wholesaleOnly: 0,
    buyNFreeOnly: 0,
    rentalOnly: 0,
    auctionOnly: 0,
    affiliateOnly: 0,
    originalOnly: 0,
    returnOnly: 0,
    sellerConfirmed: 0,
    sellerPremium: 0,
    followingOnly: followingAvailable ? 0 : null,
    near: nearAvailable ? 0 : null,
  },
});

/**
 * Адрес для счётчика «Рядом», когда сам фильтр выключен: без входа или без
 * адреса счётчика просто нет, это не ошибка.
 *
 * @param {string | undefined} userId
 */
const resolveOptionalNearContext = async (userId) => {
  if (!userId) {
    return null;
  }
  try {
    return await resolveCatalogNearContext(userId);
  } catch {
    return null;
  }
};

/**
 * Первые стадии выборки «Рядом» — те же два бакета, что в findProductsPageNear.
 *
 * @param {{
 *   collectionName: string;
 *   productsQuery: Record<string, unknown>;
 *   near: { lat: number; lon: number; maxDistanceMeters: number };
 *   viewerRegionCode: string | null;
 * }} input
 */
const buildNearFacetHead = ({
  collectionName,
  productsQuery,
  near,
  viewerRegionCode,
}) => {
  const base = normalizeProductsQueryForAggregate(productsQuery);
  return [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [near.lon, near.lat] },
        key: "productPickupLocation",
        distanceField: "_distanceMeters",
        maxDistance: near.maxDistanceMeters,
        spherical: true,
        query: buildNearGeoQuery(base),
      },
    },
    {
      $unionWith: {
        coll: collectionName,
        pipeline: [{ $match: buildNearNoLocationMatch(base, viewerRegionCode) }],
      },
    },
  ];
};

/**
 * GET /product/facets: сколько товаров останется при каждом варианте фильтра.
 *
 * Поиск всегда через regex: при включённом Atlas Search выдача ищет через
 * Atlas, и счётчики могут расходиться с ней на единицы (на проде Atlas выключен).
 *
 * @param {{ userId?: string; query: Record<string, unknown> }} input
 */
export async function getCatalogProductFacets({ userId, query }) {
  const { expireProductFlashSales } = await import("./productFlashSaleExpiry.js");
  await expireProductFlashSales();

  const filters = parseCatalogFilters(query);
  if (filters.followingOnly && !userId) {
    throw new AppError(401, USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE);
  }

  const nearContext = filters.near
    ? await resolveCatalogNearContext(userId)
    : await resolveOptionalNearContext(userId);

  const cacheKey = `facets|${buildCatalogProductsCacheKey({
    userId,
    query,
    nearPoint: nearContext
      ? `${nearContext.lat.toFixed(5)},${nearContext.lon.toFixed(5)}`
      : null,
  })}`;

  if (!filters.includeHidden) {
    const cached = getCachedCatalogProducts(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const facets = await computeCatalogProductFacets({
    userId,
    query,
    filters,
    nearContext,
  });

  if (!filters.includeHidden) {
    setCachedCatalogProducts(cacheKey, facets);
  }
  return facets;
}

/**
 * @param {{
 *   userId?: string;
 *   query: Record<string, unknown>;
 *   filters: import('./catalogProductFilters.js').CatalogFilters;
 *   nearContext: { lat: number; lon: number; maxDistanceMeters: number } | null;
 * }} input
 */
async function computeCatalogProductFacets({ userId, query, filters, nearContext }) {
  const context = await loadCatalogFilterContext({
    userId,
    filters,
    includeAllSellerSets: true,
  });
  const availability = {
    followingAvailable: Array.isArray(context.followingSellerIds),
    nearAvailable: Boolean(nearContext),
  };

  const clauses = buildCatalogFilterClauses(filters, context);
  if (!clauses) {
    return buildEmptyFacets(availability);
  }

  const coreClauses = clauses
    .filter((item) => !FACET_REPLACED_CLAUSE_KEYS.has(item.key))
    .map((item) => item.clause);
  const priceClause = clauses.find((item) => item.key === "price")?.clause ?? null;
  const deliveryClause = buildCatalogDeliveryClause(filters.delivery);

  const searchResult = await buildProductCatalogSearchQuery(
    query.search,
    { $and: coreClauses },
    { preferAtlas: false },
  );
  const coreQuery = searchResult.query;

  /** Текущие цена и способ получения — выдача, какой её видит покупатель. */
  const current = [priceClause, deliveryClause];
  /** @param {string} value */
  const withDelivery = (value) => [
    priceClause,
    buildCatalogDeliveryClause([...new Set([...filters.delivery, value])]),
  ];

  /** @type {Record<string, (Record<string, unknown> | null)[]>} */
  const variants = {
    total: current,
    deliverySeller: withDelivery("seller"),
    deliveryCourier: withDelivery("courier"),
    deliveryCarrier: withDelivery("carrier"),
    ratingMin4: [...current, buildCatalogRatingClause(FACET_RATING_MIN)],
    withReviews: [...current, buildCatalogWithReviewsClause()],
    sellerConfirmed: [...current, buildSellerSetClause(context.confirmedSellerIds)],
    sellerPremium: [...current, buildSellerSetClause(context.premiumSellerIds)],
    ...Object.fromEntries(
      CATALOG_TOGGLE_FILTER_KEYS.map((key) => [
        key,
        [...current, buildCatalogToggleClause(key)],
      ]),
    ),
  };
  if (availability.followingAvailable) {
    variants.followingOnly = [
      ...current,
      buildSellerSetClause(context.followingSellerIds),
    ];
  }

  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId,
    queryRegionCode: query.regionCode,
  });

  const Product = getCatalogProductModel();
  const head = filters.near
    ? buildNearFacetHead({
        collectionName: Product.collection.name,
        productsQuery: coreQuery,
        near: /** @type {NonNullable<typeof nearContext>} */ (nearContext),
        viewerRegionCode,
      })
    : [{ $match: normalizeProductsQueryForAggregate(coreQuery) }];

  /** @type {Record<string, Record<string, unknown>[]>} */
  const facetStages = {
    price: [
      { $match: buildFacetMatch([deliveryClause]) },
      { $group: { _id: null, prices: { $push: "$productPrice" } } },
    ],
    categories: [
      { $match: buildFacetMatch(current) },
      { $match: { productCategoryId: { $ne: null } } },
      { $group: { _id: "$productCategoryId", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: FACET_CATEGORY_LIMIT },
    ],
  };
  for (const [key, extra] of Object.entries(variants)) {
    facetStages[key] = [{ $match: buildFacetMatch(extra) }, { $count: "count" }];
  }

  const currentQuery = withExtraClauses(coreQuery, current);
  const [[row], nearCount, nearTotal] = await Promise.all([
    Product.aggregate([...head, { $facet: facetStages }]),
    nearContext
      ? countProductsNear({
          productsQuery: currentQuery,
          near: nearContext,
          viewerRegionCode,
        })
      : Promise.resolve(null),
    // С фильтром «Рядом» total считаем тем же countProductsNear, что и выдача.
    filters.near && nearContext
      ? countProductsNear({
          productsQuery: currentQuery,
          near: nearContext,
          viewerRegionCode,
        })
      : Promise.resolve(null),
  ]);

  /** @param {string} key */
  const countOf = (key) => row?.[key]?.[0]?.count ?? 0;

  const categoryRows = Array.isArray(row?.categories) ? row.categories : [];
  const categoryDocs =
    categoryRows.length > 0
      ? await ProductCategoryModel.find({
          _id: { $in: categoryRows.map((item) => item._id) },
        })
          .select("labelRu")
          .lean()
      : [];
  const labelById = new Map(
    categoryDocs.map((category) => [
      String(category._id),
      String(category.labelRu ?? ""),
    ]),
  );

  return {
    total: nearTotal ?? countOf("total"),
    price: summarizeFacetPrices(row?.price?.[0]?.prices ?? []),
    categories: categoryRows
      .filter((item) => labelById.get(String(item._id)))
      .map((item) => ({
        id: String(item._id),
        label: /** @type {string} */ (labelById.get(String(item._id))),
        count: item.count,
      })),
    options: {
      delivery: {
        seller: countOf("deliverySeller"),
        courier: countOf("deliveryCourier"),
        carrier: countOf("deliveryCarrier"),
      },
      pickupOnly: countOf("pickupOnly"),
      ratingMin4: countOf("ratingMin4"),
      withReviews: countOf("withReviews"),
      saleOnly: countOf("saleOnly"),
      flashSaleOnly: countOf("flashSaleOnly"),
      installmentOnly: countOf("installmentOnly"),
      wholesaleOnly: countOf("wholesaleOnly"),
      buyNFreeOnly: countOf("buyNFreeOnly"),
      rentalOnly: countOf("rentalOnly"),
      auctionOnly: countOf("auctionOnly"),
      affiliateOnly: countOf("affiliateOnly"),
      originalOnly: countOf("originalOnly"),
      returnOnly: countOf("returnOnly"),
      sellerConfirmed: countOf("sellerConfirmed"),
      sellerPremium: countOf("sellerPremium"),
      followingOnly: availability.followingAvailable ? countOf("followingOnly") : null,
      near: nearCount,
    },
  };
}
