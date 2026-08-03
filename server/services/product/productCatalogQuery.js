import {
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_REVIEWS,
  PRODUCT_SORT_VIEWS,
} from "../../constants/productCatalogSort.js";
import { getCatalogProductModel } from "../../db/mongoReadConnection.js";
import mongoose from "mongoose";

import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import {
  buildCatalogPromotionSortStage,
  catalogPromotionSortBoostAddFieldsStage,
} from "./productCatalogPromotionSort.js";
import { withCatalogRegionPrioritySort } from "../user/userRegionCatalogFilter.js";

const { ObjectId } = mongoose.Types;

/**
 * В aggregate `$match` строковый id не совпадает с ObjectId в БД (в отличие от countDocuments).
 *
 * @param {unknown} value
 */
const toObjectIdIfValid = (value) => {
  if (value == null) {
    return value;
  }
  if (value instanceof ObjectId) {
    return value;
  }
  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }
  return value;
};

/**
 * @param {unknown} fieldValue
 */
const normalizeObjectIdMatchField = (fieldValue) => {
  if (fieldValue == null || typeof fieldValue !== "object") {
    return toObjectIdIfValid(fieldValue);
  }
  if (Array.isArray(fieldValue)) {
    return fieldValue.map(toObjectIdIfValid);
  }
  if ("$in" in fieldValue && Array.isArray(fieldValue.$in)) {
    return { ...fieldValue, $in: fieldValue.$in.map(toObjectIdIfValid) };
  }
  if ("$nin" in fieldValue && Array.isArray(fieldValue.$nin)) {
    return { ...fieldValue, $nin: fieldValue.$nin.map(toObjectIdIfValid) };
  }
  if ("$eq" in fieldValue) {
    return { ...fieldValue, $eq: toObjectIdIfValid(fieldValue.$eq) };
  }
  return fieldValue;
};

/**
 * @param {Record<string, unknown>} productsQuery
 */
export const normalizeProductsQueryForAggregate = (productsQuery) => {
  const normalized = { ...productsQuery };
  if ("productSeller" in normalized) {
    normalized.productSeller = normalizeObjectIdMatchField(normalized.productSeller);
  }
  if ("_id" in normalized) {
    normalized._id = normalizeObjectIdMatchField(normalized._id);
  }
  return normalized;
};

/**
 * @param {import('express').Request['query']} query
 */
export const parseProductSortFromQuery = (query) => {
  const raw = query?.sort;
  if (
    raw === PRODUCT_SORT_VIEWS ||
    raw === PRODUCT_SORT_PURCHASES ||
    raw === PRODUCT_SORT_REVIEWS
  ) {
    return raw;
  }
  return PRODUCT_SORT_NEWEST;
};

const sellerLookupStages = () => [
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
    },
  },
  {
    $project: {
      productSellerArr: 0,
    },
  },
];

/**
 * @param {{ escapedRegexPattern: string; categorySlugs: string[] }} searchRank
 */
const searchRankAddFieldsStage = (searchRank) => ({
  $addFields: {
    _searchRank: {
      $switch: {
        branches: [
          {
            case: {
              $regexMatch: {
                input: { $ifNull: ["$productName", ""] },
                regex: searchRank.escapedRegexPattern,
                options: "i",
              },
            },
            then: 100,
          },
          {
            case: {
              $regexMatch: {
                input: { $ifNull: ["$productSearchBlob", ""] },
                regex: searchRank.escapedRegexPattern,
                options: "i",
              },
            },
            then: 80,
          },
        ],
        default: searchRank.categorySlugs?.length > 0 ? 50 : 0,
      },
    },
  },
});

/**
 * Сортировка каталога (+ region priority, + search rank). Без $match / skip / limit.
 *
 * @param {string} sort
 * @param {{ escapedRegexPattern: string; categorySlugs: string[] } | null} [searchRank]
 * @param {string | null} [viewerRegionCode]
 */
export const buildCatalogSortPipeline = (
  sort,
  searchRank = null,
  viewerRegionCode = null,
) => {
  const useSearchRank = Boolean(searchRank?.escapedRegexPattern);
  const stages = [];

  if (useSearchRank && searchRank?.escapedRegexPattern) {
    stages.push(searchRankAddFieldsStage(searchRank));
  }

  if (!useSearchRank && sort === PRODUCT_SORT_NEWEST) {
    stages.push(catalogPromotionSortBoostAddFieldsStage);
  }

  stages.push(
    buildCatalogPromotionSortStage(sort, {
      useSearchRank,
      searchScoreField: "_searchRank",
    }),
  );

  return withCatalogRegionPrioritySort(stages, viewerRegionCode);
};

/**
 * @param {Record<string, unknown>} productsQuery
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 * @param {{ escapedRegexPattern: string; categorySlugs: string[] } | null} [searchRank]
 * @param {string | null} [_buyerCity]
 * @param {string | null} [viewerRegionCode]
 */
export const findProductsPage = async (
  productsQuery,
  sort,
  skip,
  limit,
  searchRank = null,
  _buyerCity = null,
  viewerRegionCode = null,
) => {
  const sortPipeline = buildCatalogSortPipeline(
    sort,
    searchRank,
    viewerRegionCode,
  );

  const Product = getCatalogProductModel();

  const products = await Product.aggregate([
    { $match: normalizeProductsQueryForAggregate(productsQuery) },
    ...sortPipeline,
    { $skip: skip },
    { $limit: limit },
    ...sellerLookupStages(),
    {
      $project: {
        _searchRank: 0,
        _promotionSortTier: 0,
        _promotionSortActivatedAt: 0,
        _citySortPriority: 0,
        _regionSortPriority: 0,
      },
    },
  ]);

  return attachProductSellerSnapshots(products);
};

/**
 * @param {Record<string, unknown>} productsQuery
 */
export const countProducts = (productsQuery) =>
  getCatalogProductModel().countDocuments(productsQuery);
