import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCT_SORT_NEWEST } from "../constants/productCatalogSort.js";
import {
  buildCatalogPromotionSortBoostAddFieldsStage,
  buildCatalogPromotionSortStage,
} from "../services/product/productCatalogPromotionSort.js";
import { withCatalogRegionPrioritySort } from "../services/user/userRegionCatalogFilter.js";

describe("buildCatalogPromotionSortBoostAddFieldsStage", () => {
  it("TOP is global; regional raise needs viewer region", () => {
    const stage = buildCatalogPromotionSortBoostAddFieldsStage(null);
    assert.deepEqual(stage.$addFields._promotionGlobalTop.$cond[0], {
      $eq: [{ $ifNull: ["$catalogPromotionTier", 0] }, 2],
    });
    assert.equal(stage.$addFields._promotionSortTier.$cond[0], false);
  });

  it("Gold+Banner raise on region match; TOP stays global", () => {
    const stage = buildCatalogPromotionSortBoostAddFieldsStage("RU-MOW");
    assert.deepEqual(stage.$addFields._promotionGlobalTop.$cond[0], {
      $eq: [{ $ifNull: ["$catalogPromotionTier", 0] }, 2],
    });
    assert.deepEqual(stage.$addFields._promotionSortTier.$cond[0], {
      $and: [
        { $in: [{ $ifNull: ["$catalogPromotionTier", 0] }, [1, 3]] },
        { $eq: ["$productRegionCode", "RU-MOW"] },
      ],
    });
  });

  it("newest sort: global TOP before regional banner keys", () => {
    assert.deepEqual(buildCatalogPromotionSortStage(PRODUCT_SORT_NEWEST), {
      $sort: {
        _promotionGlobalTop: -1,
        _promotionGlobalTopActivatedAt: -1,
        _promotionSortTier: -1,
        _promotionSortActivatedAt: -1,
        createdAt: -1,
      },
    });
  });

  it("newest+search: global TOP before search rank", () => {
    assert.deepEqual(
      buildCatalogPromotionSortStage(PRODUCT_SORT_NEWEST, {
        useSearchRank: true,
        searchScoreField: "_searchRank",
      }),
      {
        $sort: {
          _promotionGlobalTop: -1,
          _promotionGlobalTopActivatedAt: -1,
          _searchRank: -1,
          _promotionSortTier: -1,
          _promotionSortActivatedAt: -1,
          createdAt: -1,
        },
      },
    );
  });

  it("region priority stays under global TOP", () => {
    const stages = withCatalogRegionPrioritySort(
      buildCatalogPromotionSortStage(PRODUCT_SORT_NEWEST),
      "RU-SPE",
    );
    assert.deepEqual(stages[1].$sort, {
      _promotionGlobalTop: -1,
      _promotionGlobalTopActivatedAt: -1,
      _regionSortPriority: 1,
      _promotionSortTier: -1,
      _promotionSortActivatedAt: -1,
      createdAt: -1,
    });
  });
});
