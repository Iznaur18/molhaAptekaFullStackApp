import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "../../constants/productPromotionConstants.js";
import {
  PRODUCT_SORT_DISCOUNT,
  PRODUCT_SORT_NEWEST,
  PRODUCT_SORT_PRICE_ASC,
  PRODUCT_SORT_PRICE_DESC,
  PRODUCT_SORT_PURCHASES,
  PRODUCT_SORT_RATING,
  PRODUCT_SORT_REVIEWS,
  PRODUCT_SORT_VIEWS,
} from "../../constants/productCatalogSort.js";

/** L2 ТОП — глобальный абсолютный топ (без региона). */
const catalogPromotionIsTopTier = {
  $eq: [{ $ifNull: ["$catalogPromotionTier", 0] }, PRODUCT_PROMOTION_TIER_TOP],
};

/** L1 Буст / L3 Баннер — поднятие только в регионе продажи. */
const catalogPromotionIsRegionalRaiseTier = {
  $in: [
    { $ifNull: ["$catalogPromotionTier", 0] },
    [PRODUCT_PROMOTION_TIER_GOLD, PRODUCT_PROMOTION_TIER_BANNER],
  ],
};

/**
 * L2 → `_promotionGlobalTop` всегда.
 * L1/L3 → `_promotionSortTier` только если регион товара = регион зрителя.
 *
 * @param {string | null | undefined} [viewerRegionCode]
 */
export const buildCatalogPromotionSortBoostAddFieldsStage = (
  viewerRegionCode = null,
) => {
  const normalized =
    typeof viewerRegionCode === "string" && viewerRegionCode.trim()
      ? viewerRegionCode.trim()
      : null;

  const catalogPromotionHasRegionRaise = normalized
    ? {
        $and: [
          catalogPromotionIsRegionalRaiseTier,
          { $eq: ["$productRegionCode", normalized] },
        ],
      }
    : false;

  return {
    $addFields: {
      _promotionGlobalTop: {
        $cond: [catalogPromotionIsTopTier, 1, 0],
      },
      _promotionGlobalTopActivatedAt: {
        $cond: [catalogPromotionIsTopTier, "$catalogPromotionActivatedAt", null],
      },
      _promotionSortTier: {
        $cond: [
          catalogPromotionHasRegionRaise,
          { $ifNull: ["$catalogPromotionTier", 0] },
          0,
        ],
      },
      _promotionSortActivatedAt: {
        $cond: [catalogPromotionHasRegionRaise, "$catalogPromotionActivatedAt", null],
      },
    },
  };
};

/** @deprecated use buildCatalogPromotionSortBoostAddFieldsStage(viewerRegionCode) */
export const catalogPromotionSortBoostAddFieldsStage =
  buildCatalogPromotionSortBoostAddFieldsStage(null);

/** ТОП выше региона и search-rank; баннер — после региона. */
export const catalogPromotionNewestSortKeys = {
  _promotionGlobalTop: -1,
  _promotionGlobalTopActivatedAt: -1,
  _promotionSortTier: -1,
  _promotionSortActivatedAt: -1,
  createdAt: -1,
};

export const catalogReviewsSortKeys = {
  averageRating: -1,
  reviewCount: -1,
  createdAt: -1,
};

/** Поле с процентом скидки для `sort=discount`. */
export const CATALOG_DISCOUNT_PERCENT_FIELD = "_discountPercent";

/**
 * Процент скидки — по той же формуле, что computeProductDiscountPercent;
 * у товара без скидки 0, и он уходит в конец.
 */
export const buildCatalogDiscountPercentAddFieldsStage = () => ({
  $addFields: {
    [CATALOG_DISCOUNT_PERCENT_FIELD]: {
      $cond: [
        {
          $and: [
            { $gt: [{ $ifNull: ["$productOldPrice", 0] }, 0] },
            { $gt: [{ $ifNull: ["$productOldPrice", 0] }, "$productPrice"] },
          ],
        },
        {
          $floor: {
            $multiply: [
              { $subtract: [1, { $divide: ["$productPrice", "$productOldPrice"] }] },
              100,
            ],
          },
        },
        0,
      ],
    },
  },
});

/** Сортировки, выбранные покупателем явно: без буста продвижения. */
const explicitCatalogSortKeys = {
  [PRODUCT_SORT_PRICE_ASC]: { productPrice: 1, createdAt: -1 },
  [PRODUCT_SORT_PRICE_DESC]: { productPrice: -1, createdAt: -1 },
  [PRODUCT_SORT_RATING]: catalogReviewsSortKeys,
  [PRODUCT_SORT_DISCOUNT]: { [CATALOG_DISCOUNT_PERCENT_FIELD]: -1, createdAt: -1 },
};

/**
 * @param {string} sort
 * @param {{ useSearchRank?: boolean; searchScoreField?: string }} [options]
 * @returns {Record<string, unknown>}
 */
export const buildCatalogPromotionSortStage = (sort, options = {}) => {
  const { useSearchRank = false, searchScoreField = "_searchRank" } = options;

  const explicitKeys = explicitCatalogSortKeys[sort];
  if (explicitKeys) {
    return {
      $sort: useSearchRank ? { [searchScoreField]: -1, ...explicitKeys } : explicitKeys,
    };
  }

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
    // newest + search: ТОП выше релевантности поиска
    return {
      $sort: {
        _promotionGlobalTop: -1,
        _promotionGlobalTopActivatedAt: -1,
        [searchScoreField]: -1,
        _promotionSortTier: -1,
        _promotionSortActivatedAt: -1,
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
  if (sort === PRODUCT_SORT_REVIEWS) {
    return { $sort: catalogReviewsSortKeys };
  }
  if (sort !== PRODUCT_SORT_NEWEST) {
    return { $sort: { createdAt: -1 } };
  }

  return { $sort: catalogPromotionNewestSortKeys };
};
