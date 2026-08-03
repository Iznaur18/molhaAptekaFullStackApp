import {
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_REVIEWS,
  PRODUCT_SORT_VIEWS,
} from "../../constants/productCatalogSort.js";

/** L1 — только оформление; поднятие в ленте с tier >= 2. */
const catalogPromotionTierHasCatalogBoost = {
  $gte: [{ $ifNull: ["$catalogPromotionTier", 0] }, 2],
};

export const catalogPromotionSortBoostAddFieldsStage = {
  $addFields: {
    _promotionSortTier: {
      $cond: [
        catalogPromotionTierHasCatalogBoost,
        { $ifNull: ["$catalogPromotionTier", 0] },
        0,
      ],
    },
    _promotionSortActivatedAt: {
      $cond: [
        catalogPromotionTierHasCatalogBoost,
        "$catalogPromotionActivatedAt",
        null,
      ],
    },
  },
};

export const catalogPromotionNewestSortKeys = {
  _promotionSortTier: -1,
  _promotionSortActivatedAt: -1,
  createdAt: -1,
};

export const catalogReviewsSortKeys = {
  averageRating: -1,
  reviewCount: -1,
  createdAt: -1,
};

/**
 * @param {string} sort
 * @param {{ useSearchRank?: boolean; searchScoreField?: string }} [options]
 * @returns {Record<string, unknown>}
 */
export const buildCatalogPromotionSortStage = (sort, options = {}) => {
  const {
    useSearchRank = false,
    searchScoreField = "_searchRank",
  } = options;

  if (useSearchRank) {
    if (sort === PRODUCT_SORT_PURCHASES) {
      return {
        $sort: {
          [searchScoreField]: -1,
          soldQuantity: -1,
          createdAt: -1,
        },
      };
    }
    if (sort === PRODUCT_SORT_VIEWS) {
      return {
        $sort: {
          [searchScoreField]: -1,
          uniqueViewerCount: -1,
          createdAt: -1,
        },
      };
    }
    if (sort === PRODUCT_SORT_REVIEWS) {
      return {
        $sort: {
          [searchScoreField]: -1,
          ...catalogReviewsSortKeys,
        },
      };
    }
    return {
      $sort: {
        [searchScoreField]: -1,
        ...catalogPromotionNewestSortKeys,
      },
    };
  }

  if (sort === PRODUCT_SORT_PURCHASES) {
    return { $sort: { soldQuantity: -1, createdAt: -1 } };
  }
  if (sort === PRODUCT_SORT_VIEWS) {
    return { $sort: { uniqueViewerCount: -1, createdAt: -1 } };
  }
  if (sort === PRODUCT_SORT_REVIEWS) {
    return { $sort: catalogReviewsSortKeys };
  }
  if (sort !== PRODUCT_SORT_NEWEST) {
    return { $sort: { createdAt: -1 } };
  }

  return { $sort: catalogPromotionNewestSortKeys };
};
