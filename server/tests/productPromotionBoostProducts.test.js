import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCT_PROMOTION_TIER_GOLD } from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  BOOST_PRODUCTS_SORT,
  buildActiveBoostProductsMatch,
} from "../services/product/productPromotionBoostProducts.js";

describe("buildActiveBoostProductsMatch", () => {
  const now = new Date("2026-10-07T12:00:00.000Z");

  it("берёт только действующий «Буст» у товаров, видимых в каталоге", () => {
    const match = buildActiveBoostProductsMatch({
      now,
      viewerRegionCode: "RU-KDA",
      hiddenSellerIds: [],
    });

    assert.equal(match.catalogPromotionTier, PRODUCT_PROMOTION_TIER_GOLD);
    assert.deepEqual(match.catalogPromotionExpiresAt, { $gt: now });
    assert.equal(match.productModerationStatus, PRODUCT_MODERATION_APPROVED);
    assert.deepEqual(match.productIsAvailable, { $ne: false });
    assert.deepEqual(match.$or, [
      { productOutOfStock: true },
      { productStockQuantity: { $gt: 0 } },
    ]);
    assert.equal(match.productRegionCode, "RU-KDA");
    assert.equal("productSeller" in match, false);
  });

  it("без региона зрителя подставляет регион по умолчанию, а не все регионы", () => {
    const match = buildActiveBoostProductsMatch({
      now,
      viewerRegionCode: "",
      hiddenSellerIds: [],
    });

    assert.equal(match.productRegionCode, "RU-MOW");
  });

  it("исключает скрытых продавцов", () => {
    const match = buildActiveBoostProductsMatch({
      now,
      viewerRegionCode: "RU-MOW",
      hiddenSellerIds: ["u1", "u2"],
    });

    assert.deepEqual(match.productSeller, { $nin: ["u1", "u2"] });
  });
});

describe("BOOST_PRODUCTS_SORT", () => {
  it("свежие бусты первыми, порядок стабилен", () => {
    assert.deepEqual(BOOST_PRODUCTS_SORT, {
      catalogPromotionActivatedAt: -1,
      _id: -1,
    });
  });
});
