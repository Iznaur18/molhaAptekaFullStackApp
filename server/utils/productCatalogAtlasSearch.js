import {
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_VIEWS,
} from "../constants/productCatalogSort.js";
import { ProductModel } from "../models/index.js";

import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { buildProductAtlasSearchStage } from "./buildProductAtlasSearchStage.js";
import { normalizeProductsQueryForAggregate } from "./productCatalogQuery.js";
import {
  buildCatalogPromotionSortStage,
  catalogPromotionSortBoostAddFieldsStage,
} from "./productCatalogPromotionSort.js";

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
 * @param {string | null} [buyerCity]
 */
const sortStagesForAtlasCatalog = (sort, buyerCity = null) => {
  const stages = [];
  if (sort === PRODUCT_SORT_NEWEST) {
    stages.push(catalogPromotionSortBoostAddFieldsStage);
  }

  const sortStage = buildCatalogPromotionSortStage(sort, {
    useSearchRank: true,
    searchScoreField: "_searchScore",
    buyerCity,
  });

  if (Array.isArray(sortStage)) {
    stages.push(...sortStage);
  } else {
    stages.push(sortStage);
  }

  return stages;
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 * @param {string | null} [buyerCity]
 */
export const findCatalogProductsPageAtlas = async (
  searchResult,
  sort,
  skip,
  limit,
  buyerCity = null,
) => {
  if (!searchResult.atlasSearch) {
    throw new Error("findCatalogProductsPageAtlas requires atlasSearch");
  }

  const products = await ProductModel.aggregate([
    buildProductAtlasSearchStage(searchResult.atlasSearch),
    { $addFields: { _searchScore: { $meta: "searchScore" } } },
    { $match: normalizeProductsQueryForAggregate(searchResult.baseQuery) },
    ...sortStagesForAtlasCatalog(sort, buyerCity),
    { $skip: skip },
    { $limit: limit },
    ...sellerLookupStages(),
    { $project: { _searchScore: 0, _promotionSortTier: 0, _citySortPriority: 0 } },
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
