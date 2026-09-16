import { describe, expect, it } from "vitest";

import { parseCatalogQueryFromSearchParams } from "../../../entities/product/lib/catalogCatalogQuery.js";
import {
  applyCatalogFiltersDraft,
  buildCatalogFiltersFacetsParams,
  buildCatalogPricePresets,
  createCatalogFiltersDraft,
  createEmptyCatalogFiltersDraft,
  isCatalogFiltersDraftEmpty,
  toggleCatalogFiltersDelivery,
} from "./catalogFiltersDraft.js";

const CATEGORY_ID = "64aaaaaaaaaaaaaaaaaaaaaa";

const applied = parseCatalogQueryFromSearchParams(
  new URLSearchParams(
    `categoryId=${CATEGORY_ID}&sort=purchases&saleOnly=true&priceMax=300`,
  ),
);

describe("catalogFiltersDraft", () => {
  it("keeps what the window does not show (category) when applying", () => {
    const draft = {
      ...createCatalogFiltersDraft(applied),
      sort: "price_asc",
      saleOnly: false,
      delivery: ["courier", "seller"],
    };

    expect(applyCatalogFiltersDraft(applied, draft)).toMatchObject({
      categoryId: CATEGORY_ID,
      sort: "price_asc",
      saleOnly: false,
      priceMax: 300,
      delivery: ["seller", "courier"],
    });
  });

  it("reset clears filters and sort but keeps the category", () => {
    expect(
      applyCatalogFiltersDraft(applied, createEmptyCatalogFiltersDraft()),
    ).toMatchObject({
      categoryId: CATEGORY_ID,
      sort: "newest",
      saleOnly: false,
      priceMax: null,
      delivery: [],
    });
    expect(isCatalogFiltersDraftEmpty(createEmptyCatalogFiltersDraft())).toBe(true);
    expect(isCatalogFiltersDraftEmpty(createCatalogFiltersDraft(applied))).toBe(false);
  });

  it("builds facets params with search, region and draft, without sort", () => {
    const params = buildCatalogFiltersFacetsParams({
      query: applied,
      draft: {
        ...createCatalogFiltersDraft(applied),
        priceMin: 500,
        priceMax: 100,
        pickupOnly: true,
      },
      searchTerm: " молоко ",
      viewerRegionCode: "RU-MOW",
      isCatalogBrowserMainViewActive: false,
      isSubcategoryFilterEnabled: true,
    });

    expect(params).toMatchObject({
      search: "молоко",
      categoryId: CATEGORY_ID,
      saleOnly: true,
      priceMin: 100,
      priceMax: 500,
      pickupOnly: true,
      regionCode: "RU-MOW",
    });
    expect(params).not.toHaveProperty("sort");
    expect(params).not.toHaveProperty("scope");
  });

  it("toggles delivery options in contract order", () => {
    expect(toggleCatalogFiltersDelivery(["carrier"], "seller")).toEqual([
      "seller",
      "carrier",
    ]);
    expect(toggleCatalogFiltersDelivery(["seller", "carrier"], "seller")).toEqual([
      "carrier",
    ]);
  });

  it("price presets are rounded quantiles below the maximum", () => {
    expect(
      buildCatalogPricePresets({
        min: 1,
        p25: 63.2,
        p50: 98,
        p75: 162,
        p90: 295,
        max: 2850,
      }),
    ).toEqual([64, 162, 295]);
    expect(
      buildCatalogPricePresets({
        min: 10,
        p25: 10,
        p50: 10,
        p75: 10,
        p90: 10,
        max: 10,
      }),
    ).toEqual([]);
    expect(buildCatalogPricePresets(null)).toEqual([]);
  });
});
