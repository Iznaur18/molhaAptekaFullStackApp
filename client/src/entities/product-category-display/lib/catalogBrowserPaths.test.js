import { describe, expect, it } from "vitest";

import {
  buildCatalogBrowserLocation,
  buildCatalogProductsLocation,
} from "./catalogBrowserPaths.js";
import { CATALOG_SORT_NEWEST } from "../../product/model/productConstants.js";

const baseQuery = {
  sort: CATALOG_SORT_NEWEST,
  category: null,
  categoryId: "64aaaaaaaaaaaaaaaaaaaaaa",
  sellerPersonalCategoryId: null,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
  rentalOnly: false,
  affiliateOnly: false,
  wholesaleOnly: false,
  buyNFreeOnly: false,
  originalOnly: false,
  near: false,
  flashSaleOnly: false,
};

describe("buildCatalogProductsLocation", () => {
  it("routes filtered products to home when compact", () => {
    expect(buildCatalogProductsLocation(baseQuery, { compact: true })).toBe(
      "/?sort=newest&categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("routes filtered products to /catalog on desktop", () => {
    expect(buildCatalogProductsLocation(baseQuery)).toBe(
      "/catalog?sort=newest&categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("buildCatalogBrowserLocation always uses /catalog", () => {
    expect(buildCatalogBrowserLocation(baseQuery)).toBe(
      "/catalog?sort=newest&categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("includes near=true", () => {
    expect(
      buildCatalogProductsLocation({
        ...baseQuery,
        categoryId: null,
        near: true,
      }),
    ).toBe("/catalog?sort=newest&near=true");
  });
});
