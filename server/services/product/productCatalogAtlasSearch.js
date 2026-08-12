import { PRODUCT_SORT_NEWEST } from "../../constants/productCatalogSort.js";
import { getCatalogProductModel } from "../../db/mongoReadConnection.js";
import { withCatalogRegionPrioritySort } from "../user/userRegionCatalogFilter.js";

import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { buildProductAtlasSearchStage } from "./buildProductAtlasSearchStage.js";
import { normalizeProductsQueryForAggregate } from "./productCatalogQuery.js";
import {
  buildCatalogPromotionSortStage,
  buildCatalogPromotionSortBoostAddFieldsStage,
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
 * @param {string | null} [viewerRegionCode]
 */
const sortStagesForAtlasCatalog = (sort, viewerRegionCode = null) => {
  const stages = [];
  if (sort === PRODUCT_SORT_NEWEST) {
    stages.push(buildCatalogPromotionSortBoostAddFieldsStage(viewerRegionCode));
  }

  stages.push(
    buildCatalogPromotionSortStage(sort, {
      useSearchRank: true,
      searchScoreField: "_searchScore",
    }),
  );

  return withCatalogRegionPrioritySort(stages, viewerRegionCode);
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 * @param {string | null} [_buyerCity]
 * @param {string | null} [viewerRegionCode]
 */
export const findCatalogProductsPageAtlas = async (
  searchResult,
  sort,
  skip,
  limit,
  _buyerCity = null,
  viewerRegionCode = null,
) => {
  if (!searchResult.atlasSearch) {
    throw new Error("findCatalogProductsPageAtlas requires atlasSearch");
  }

  const Product = getCatalogProductModel();

  const products = await Product.aggregate([
    buildProductAtlasSearchStage(searchResult.atlasSearch),
    { $addFields: { _searchScore: { $meta: "searchScore" } } },
    { $match: normalizeProductsQueryForAggregate(searchResult.baseQuery) },
    ...sortStagesForAtlasCatalog(sort, viewerRegionCode),
    { $skip: skip },
    { $limit: limit },
    ...sellerLookupStages(),
    {
      $project: {
        _searchScore: 0,
        _promotionGlobalTop: 0,
        _promotionGlobalTopActivatedAt: 0,
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
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 */
export const countCatalogProductsAtlas = async (searchResult) => {
  if (!searchResult.atlasSearch) {
    throw new Error("countCatalogProductsAtlas requires atlasSearch");
  }

  const Product = getCatalogProductModel();
  const [result] = await Product.aggregate([
    buildProductAtlasSearchStage(searchResult.atlasSearch),
    { $match: normalizeProductsQueryForAggregate(searchResult.baseQuery) },
    { $count: "total" },
  ]);

  return result?.total ?? 0;
};
