import { describe, expect, it } from "vitest";

import {
  buildCatalogSearchParams,
  hasCatalogExtraFilters,
  parseCatalogQueryFromSearchParams,
} from "./catalogCatalogQuery.js";

/** @param {string} search */
const parse = (search) =>
  parseCatalogQueryFromSearchParams(new URLSearchParams(search));

describe("catalogCatalogQuery: фильтры окна", () => {
  it("parses price, delivery, rating and seller flags from the address", () => {
    expect(
      parse(
        "sort=price_asc&priceMin=100&priceMax=500&delivery=courier,seller,teleport" +
          "&pickupOnly=true&ratingMin=4&withReviews=true&returnOnly=true" +
          "&sellerConfirmed=true&sellerPremium=true",
      ),
    ).toMatchObject({
      sort: "price_asc",
      priceMin: 100,
      priceMax: 500,
      delivery: ["seller", "courier"],
      pickupOnly: true,
      ratingMin: 4,
      withReviews: true,
      returnOnly: true,
      sellerConfirmed: true,
      sellerPremium: true,
    });
  });

  it("drops invalid values and swaps a reversed price range", () => {
    expect(parse("priceMin=900&priceMax=100&ratingMin=2&sort=teleport")).toMatchObject({
      sort: "newest",
      priceMin: 100,
      priceMax: 900,
      ratingMin: null,
    });
    expect(parse("priceMin=-5&priceMax=1.5")).toMatchObject({
      priceMin: null,
      priceMax: null,
    });
  });

  it("round-trips through buildCatalogSearchParams", () => {
    const query = parse(
      "sort=discount&priceMax=162&delivery=carrier,seller&ratingMin=4",
    );
    const built = buildCatalogSearchParams(query);

    expect(built.get("delivery")).toBe("seller,carrier");
    expect(parseCatalogQueryFromSearchParams(built)).toEqual(query);
  });

  it("does not write empty filters to the address", () => {
    expect(buildCatalogSearchParams(parse("")).toString()).toBe("");
  });

  it("hasCatalogExtraFilters", () => {
    expect(hasCatalogExtraFilters(null)).toBe(false);
    expect(hasCatalogExtraFilters(parse("sort=price_asc"))).toBe(false);
    expect(hasCatalogExtraFilters({ delivery: ["seller"] })).toBe(true);
    expect(hasCatalogExtraFilters(parse("sellerPremium=true"))).toBe(true);
  });
});
