import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyCatalogFiltersDraft,
  buildCatalogPricePresets,
  createCatalogFiltersDraft,
  createEmptyCatalogFiltersDraft,
  isCatalogFiltersDraftEmpty,
  isCatalogPricePresetSelected,
  pickCatalogExtraFilters,
  toggleCatalogFiltersDelivery,
  toggleCatalogFiltersRating,
  toggleCatalogPricePreset,
} from "../dist/index.js";

describe("catalogFilters", () => {
  it("pickCatalogExtraFilters отбрасывает мусор и меняет местами «от» и «до»", () => {
    assert.deepEqual(
      pickCatalogExtraFilters({
        priceMin: 500,
        priceMax: 100,
        delivery: ["carrier", "seller", "teleport", "seller"],
        ratingMin: 2,
        pickupOnly: "true",
      }),
      {
        priceMin: 100,
        priceMax: 500,
        delivery: ["seller", "carrier"],
        pickupOnly: false,
        ratingMin: null,
        withReviews: false,
        returnOnly: false,
        sellerConfirmed: false,
        sellerPremium: false,
      },
    );
  });

  it("черновик поверх запроса сохраняет то, чего в окне нет", () => {
    const draft = {
      ...createCatalogFiltersDraft({ sort: "purchases", saleOnly: true }),
      sort: "price_asc",
      saleOnly: false,
      delivery: ["courier", "seller"],
    };
    const next = applyCatalogFiltersDraft({ categoryId: "c1", search: "чай" }, draft);
    assert.equal(next.categoryId, "c1");
    assert.equal(next.search, "чай");
    assert.equal(next.sort, "price_asc");
    assert.equal(next.saleOnly, false);
    assert.deepEqual(next.delivery, ["seller", "courier"]);
  });

  it("пустой черновик — «Новинки» без фильтров", () => {
    assert.equal(isCatalogFiltersDraftEmpty(createEmptyCatalogFiltersDraft()), true);
    assert.equal(
      isCatalogFiltersDraftEmpty(
        createCatalogFiltersDraft({ sort: "newest", near: true }),
      ),
      false,
    );
  });

  it("быстрые варианты цены и их переключение", () => {
    const presets = buildCatalogPricePresets({
      min: 10,
      p25: 99.2,
      p50: 300,
      p75: 500,
      p90: 2000,
      max: 2000,
    });
    assert.deepEqual(presets, [100, 500]);

    let draft = { ...createEmptyCatalogFiltersDraft(), priceMin: 50 };
    draft = toggleCatalogPricePreset(draft, 500);
    assert.equal(draft.priceMin, null);
    assert.equal(isCatalogPricePresetSelected(draft, 500), true);
    draft = toggleCatalogPricePreset(draft, 500);
    assert.equal(draft.priceMax, null);
  });

  it("получение и рейтинг переключаются туда-обратно", () => {
    assert.deepEqual(toggleCatalogFiltersDelivery(["carrier"], "seller"), [
      "seller",
      "carrier",
    ]);
    assert.deepEqual(toggleCatalogFiltersDelivery(["seller"], "seller"), []);
    const rated = toggleCatalogFiltersRating(createEmptyCatalogFiltersDraft());
    assert.equal(rated.ratingMin, 4);
    assert.equal(toggleCatalogFiltersRating(rated).ratingMin, null);
  });
});
