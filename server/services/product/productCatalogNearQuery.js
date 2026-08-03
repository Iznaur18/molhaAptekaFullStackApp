import { getCatalogProductModel } from "../../db/mongoReadConnection.js";

import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import {
  buildCatalogSortPipeline,
  normalizeProductsQueryForAggregate,
} from "./productCatalogQuery.js";

const EARTH_RADIUS_METERS = 6_378_100;

/**
 * Самовывоз включён (default true у старых документов).
 * @returns {Record<string, unknown>}
 */
const pickupEligibleMatch = () => ({
  productPickupEnabled: { $ne: false },
});

/**
 * Нет GeoJSON-точки — второй бакет «Рядом».
 * @param {Record<string, unknown>} baseQuery
 */
export const buildNearNoLocationMatch = (baseQuery) => ({
  $and: [
    baseQuery,
    pickupEligibleMatch(),
    {
      $or: [
        { productPickupLocation: { $exists: false } },
        { productPickupLocation: null },
      ],
    },
  ],
});

/**
 * База для $geoNear.query (точка обязана быть у документа для индекса).
 * @param {Record<string, unknown>} baseQuery
 */
export const buildNearGeoQuery = (baseQuery) => ({
  ...baseQuery,
  ...pickupEligibleMatch(),
});

/**
 * @param {Record<string, unknown>[]} sortPipeline
 */
const withNearBucketSort = (sortPipeline) =>
  sortPipeline.map((stage) => {
    if (stage && typeof stage === "object" && stage.$sort) {
      return {
        $sort: {
          _nearBucket: 1,
          _distanceMeters: 1,
          ...stage.$sort,
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
  const noLocationMatch = buildNearNoLocationMatch(base);
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
 * }} input
 */
export const countProductsNear = async ({ productsQuery, near }) => {
  const Product = getCatalogProductModel();
  const base = normalizeProductsQueryForAggregate(productsQuery);
  const geoQuery = buildNearGeoQuery(base);
  const noLocationMatch = buildNearNoLocationMatch(base);
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
