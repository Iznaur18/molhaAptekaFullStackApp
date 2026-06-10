import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCatalogCitySortPriorityStage,
  buildCatalogCitySortStage,
  buildProductSaleCityMatch,
} from "../utils/userCityCatalogFilter.js";

describe("buildCatalogCitySortPriorityStage", () => {
  it("ставит приоритет 0 для совпадающего normalized-города", () => {
    const stage = buildCatalogCitySortPriorityStage("Москва");
    assert.ok(stage);
    assert.deepEqual(stage.$addFields._citySortPriority.$cond[0], {
      $eq: ["$productSaleCityNormalized", "москва"],
    });
    assert.equal(stage.$addFields._citySortPriority.$cond[1], 0);
    assert.equal(stage.$addFields._citySortPriority.$cond[2], 1);
  });

  it("возвращает null для пустого города", () => {
    assert.equal(buildCatalogCitySortPriorityStage(""), null);
  });
});

describe("buildCatalogCitySortStage", () => {
  it("сортирует сначала по приоритету, потом по городу", () => {
    assert.deepEqual(buildCatalogCitySortStage().$sort, {
      _citySortPriority: 1,
      productSaleCity: 1,
      createdAt: -1,
    });
  });
});

describe("buildProductSaleCityMatch", () => {
  it("матчит по productSaleCityNormalized и «везде»", () => {
    const match = buildProductSaleCityMatch("г Москва");
    assert.ok(match?.$or);
    assert.equal(match.$or[0].productSaleCityNormalized, "москва");
  });
});
