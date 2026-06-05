import {
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_VIEWS,
} from "../constants/productCatalogSort.js";
import { ProductModel } from "../models/index.js";

import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { buildProductAtlasSearchStage } from "./buildProductAtlasSearchStage.js";
import { normalizeProductsQueryForAggregate } from "./productCatalogQuery.js";

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
 * @param {string} sort
 */
const sortStageForAtlasCatalog = (sort) => {
  if (sort === PRODUCT_SORT_PURCHASES) {
    return {
      $sort: {
        _searchScore: -1,
        soldQuantity: -1,
        createdAt: -1,
      },
    };
  }
  if (sort === PRODUCT_SORT_VIEWS) {
    return {
      $sort: {
        _searchScore: -1,
        uniqueViewerCount: -1,
        createdAt: -1,
      },
    };
  }
  return {
    $sort: {
      _searchScore: -1,
      catalogPromotionActivatedAt: -1,
      catalogPromotionExpiresAt: -1,
      createdAt: -1,
    },
  };
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 */
export const findCatalogProductsPageAtlas = async (searchResult, sort, skip, limit) => {
  if (!searchResult.atlasSearch) {
    throw new Error("findCatalogProductsPageAtlas requires atlasSearch");
  }

  const products = await ProductModel.aggregate([
    buildProductAtlasSearchStage(searchResult.atlasSearch),
    { $addFields: { _searchScore: { $meta: "searchScore" } } },
    { $match: normalizeProductsQueryForAggregate(searchResult.baseQuery) },
    sortStageForAtlasCatalog(sort),
    { $skip: skip },
    { $limit: limit },
    ...sellerLookupStages(),
    { $project: { _searchScore: 0 } },
  ]);

  return attachProductSellerSnapshots(products);
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 */
export const countCatalogProductsAtlas = async (searchResult) => {
  if (!searchResult.atlasSearch) {
    throw new Error("countCatalogProductsAtlas requires atlasSearch");
  }

  const [result] = await ProductModel.aggregate([
    buildProductAtlasSearchStage(searchResult.atlasSearch),
    { $match: normalizeProductsQueryForAggregate(searchResult.baseQuery) },
    { $count: "total" },
  ]);

  return result?.total ?? 0;
};
