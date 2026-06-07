import { describe, expect, it } from "vitest";

import { flattenCatalogProducts } from "./catalogProductsQueryCache.js";

describe("flattenCatalogProducts", () => {
  it("returns empty array for missing data", () => {
    expect(flattenCatalogProducts(undefined)).toEqual([]);
    expect(flattenCatalogProducts({ pages: [] })).toEqual([]);
  });

  it("merges pages and deduplicates by product id", () => {
    const productA = { _id: "1", productName: "A" };
    const productB = { _id: "2", productName: "B" };
    const productAUpdated = { _id: "1", productName: "A2" };

    const merged = flattenCatalogProducts({
      pages: [
        { products: [productA, productB], pagination: { page: 1 } },
        { products: [productAUpdated], pagination: { page: 2 } },
      ],
    });

    expect(merged).toEqual([productA, productB]);
  });
});
