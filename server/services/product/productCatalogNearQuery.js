import { getCatalogProductModel } from "../../db/mongoReadConnection.js";

import { buildProductRegionMatch } from "../user/userRegionCatalogFilter.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import {
  buildCatalogSortPipeline,
  normalizeProductsQueryForAggregate,
} from "./productCatalogQuery.js";

const EARTH_RADIUS_METERS = 6_378_100;

/** Match, который не находит документов (пустой второй бакет). */
const IMPOSSIBLE_MATCH = Object.freeze({ _id: { $exists: false } });

/**
 * Самовывоз включён (default true у старых документов).
 * @returns {Record<string, unknown>}
 */
const pickupEligibleMatch = () => ({
  productPickupEnabled: { $ne: false },
});

/**
 * Второй бакет «Рядом»: нет GeoJSON-точки + тот же регион зрителя.
 * @param {Record<string, unknown>} baseQuery
 * @param {string | null | undefined} viewerRegionCode
 */
export const buildNearNoLocationMatch = (baseQuery, viewerRegionCode = null) => {
  const code = String(viewerRegionCode ?? "").trim();
  if (!code) {
    return { $and: [baseQuery, IMPOSSIBLE_MATCH] };
  }

  return {
    $and: [
      baseQuery,
      pickupEligibleMatch(),
      buildProductRegionMatch(code),
      {
        $or: [
          { productPickupLocation: { $exists: false } },
          { productPickupLocation: null },
        ],
      },
    ],
  };
};

/**
 * База для $geoNear.query (точка обязана быть у документа для индекса).
 * @param {Record<string, unknown>} baseQuery
 */
export const buildNearGeoQuery = (baseQuery) => ({
  ...baseQuery,
  ...pickupEligibleMatch(),
});

/**
 * Distance-first: `_nearBucket` → `_distanceMeters` → остальной catalog sort.
 * @param {Record<string, unknown>[]} sortPipeline
 */
const withNearBucketSort = (sortPipeline) =>
  sortPipeline.map((stage) => {
    if (stage && typeof stage === "object" && stage.$sort) {
      const restSort = { ...stage.$sort };
      delete restSort._nearBucket;
      delete restSort._distanceMeters;
      return {
        $sort: {
          _nearBucket: 1,
          _distanceMeters: 1,
          ...restSort,
        },
      };
    }
    return stage;
  });

/**
 * @param {{
 *   productsQuery: Record<string, unknown>;
 *   sort: string;
 *   skip: number;
 *   limit: number;
 *   searchRank?: { escapedRegexPattern: string; categorySlugs: string[] } | null;
 *   viewerRegionCode?: string | null;
 *   near: { lat: number; lon: number; maxDistanceMeters: number };
 * }} input
 */
export const findProductsPageNear = async ({
  productsQuery,
  sort,
  skip,
  limit,
  searchRank = null,
  viewerRegionCode = null,
  near,
}) => {
  const Product = getCatalogProductModel();
  const base = normalizeProductsQueryForAggregate(productsQuery);
  const geoQuery = buildNearGeoQuery(base);
  const noLocationMatch = buildNearNoLocationMatch(base, viewerRegionCode);
  const sortPipeline = withNearBucketSort(
    buildCatalogSortPipeline(sort, searchRank, viewerRegionCode),
  );

  const products = await Product.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [near.lon, near.lat] },
        key: "productPickupLocation",
        distanceField: "_distanceMeters",
        maxDistance: near.maxDistanceMeters,
        spherical: true,
        query: geoQuery,
      },
    },
    { $addFields: { _nearBucket: 0 } },
    {
      $unionWith: {
        coll: Product.collection.name,
        pipeline: [
          { $match: noLocationMatch },
          {
            $addFields: {
              _nearBucket: 1,
              _distanceMeters: Number.MAX_SAFE_INTEGER,
            },
          },
        ],
      },
    },
    ...sortPipeline,
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "productSeller",
        foreignField: "_id",
        as: "productSellerArr",
      },
    },
    {
      $addFields: {
        productSeller: { $arrayElemAt: ["$productSellerArr", 0] },
        distanceMeters: {
          $cond: [
            { $eq: ["$_nearBucket", 0] },
            "$_distanceMeters",
            "$$REMOVE",
          ],
        },
      },
    },
    {
      $project: {
        productSellerArr: 0,
        _searchRank: 0,
        _promotionGlobalTop: 0,
        _promotionGlobalTopActivatedAt: 0,
        _promotionSortTier: 0,
        _promotionSortActivatedAt: 0,
        _citySortPriority: 0,
        _regionSortPriority: 0,
        _nearBucket: 0,
        _distanceMeters: 0,
      },
    },
  ]);

  return attachProductSellerSnapshots(products);
};

/**
 * @param {{
 *   productsQuery: Record<string, unknown>;
 *   near: { lat: number; lon: number; maxDistanceMeters: number };
 *   viewerRegionCode?: string | null;
 * }} input
 */
export const countProductsNear = async ({
  productsQuery,
  near,
  viewerRegionCode = null,
}) => {
  const Product = getCatalogProductModel();
  const base = normalizeProductsQueryForAggregate(productsQuery);
  const geoQuery = buildNearGeoQuery(base);
  const noLocationMatch = buildNearNoLocationMatch(base, viewerRegionCode);
  const radiusRadians = near.maxDistanceMeters / EARTH_RADIUS_METERS;

  const [nearbyTotal, noLocationTotal] = await Promise.all([
    Product.countDocuments({
      ...geoQuery,
      productPickupLocation: {
        $geoWithin: {
          $centerSphere: [[near.lon, near.lat], radiusRadians],
        },
      },
    }),
    Product.countDocuments(noLocationMatch),
  ]);

  return nearbyTotal + noLocationTotal;
};
