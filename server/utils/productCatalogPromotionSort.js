import {
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_VIEWS,
} from "../constants/productCatalogSort.js";

export const catalogPromotionSortBoostAddFieldsStage = {
  $addFields: {
    _promotionSortTier: {
      $cond: [
        { $gte: [{ $ifNull: ["$catalogPromotionTier", 0] }, 2] },
        { $ifNull: ["$catalogPromotionTier", 0] },
        0,
      ],
    },
  },
};

/**
 * @param {string} sort
 * @param {{ useSearchRank?: boolean; searchScoreField?: string }} [options]
 */
export const buildCatalogPromotionSortStage = (sort, options = {}) => {
  const { useSearchRank = false, searchScoreField = "_searchRank" } = options;

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
    return {
      $sort: {
        [searchScoreField]: -1,
        catalogPromotionTier: -1,
        catalogPromotionActivatedAt: -1,
        createdAt: -1,
      },
    };
  }

  if (sort === PRODUCT_SORT_PURCHASES) {
    return { $sort: { soldQuantity: -1, createdAt: -1 } };
  }
  if (sort === PRODUCT_SORT_VIEWS) {
    return { $sort: { uniqueViewerCount: -1, createdAt: -1 } };
  }
  if (sort !== PRODUCT_SORT_NEWEST) {
    return { $sort: { createdAt: -1 } };
  }

  return {
    $sort: {
      _promotionSortTier: -1,
      catalogPromotionActivatedAt: -1,
      createdAt: -1,
    },
  };
};
