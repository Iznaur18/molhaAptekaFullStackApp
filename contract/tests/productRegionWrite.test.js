import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catalogProductsQuerySchema,
  patchMyProductBodySchema,
} from "../src/index.js";

describe("productRegionCode + legacy category write", () => {
  it("принимает underscore slug и регион в PATCH body", () => {
    const parsed = patchMyProductBodySchema.safeParse({
      productCategory: "home_garden",
      productRegionCode: "RU-CE",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.productCategory, "home_garden");
      assert.equal(parsed.data.productRegionCode, "RU-CE");
    }
  });

  it("отклоняет неизвестный slug категории", () => {
    const parsed = patchMyProductBodySchema.safeParse({
      productCategory: "not_a_real_category",
      productRegionCode: "RU-MOW",
    });
    assert.equal(parsed.success, false);
  });

  it("catalog query принимает regionCode и underscore category", () => {
    const parsed = catalogProductsQuerySchema.safeParse({
      regionCode: "RU-SPE",
      productCategory: "beauty_health",
    });
    assert.equal(parsed.success, true);
  });
});
