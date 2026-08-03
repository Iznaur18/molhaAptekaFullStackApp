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
  near: false,
};

describe("buildCatalogProductsLocation", () => {
  it("routes filtered products to home when compact", () => {
    expect(buildCatalogProductsLocation(baseQuery, { compact: true })).toBe(
      "/?categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("routes filtered products to /catalog on desktop", () => {
    expect(buildCatalogProductsLocation(baseQuery)).toBe(
      "/catalog?categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("buildCatalogBrowserLocation always uses /catalog", () => {
    expect(buildCatalogBrowserLocation(baseQuery)).toBe(
      "/catalog?categoryId=64aaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("includes near=true", () => {
    expect(
      buildCatalogProductsLocation({
        ...baseQuery,
        categoryId: null,
        near: true,
      }),
    ).toBe("/catalog?near=true");
  });
});
