import { describe, expect, it } from "vitest";

import {
  flattenCatalogProducts,
  patchCatalogQueryData,
} from "./catalogProductsQueryCache.js";

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

describe("patchCatalogQueryData", () => {
  it("patches single-product by-id cache", () => {
    const product = { _id: "42", productName: "A", averageRating: 0, reviewCount: 0 };

    const patched = patchCatalogQueryData(product, "42", (row) => ({
      ...row,
      averageRating: 4.5,
      reviewCount: 3,
    }));

    expect(patched).toEqual({
      _id: "42",
      productName: "A",
      averageRating: 4.5,
      reviewCount: 3,
    });
  });

  it("patches infinite catalog pages without touching unrelated by-id cache shape", () => {
    const product = { _id: "42", productName: "A", averageRating: 0, reviewCount: 0 };
    const other = { _id: "99", productName: "B" };

    const patched = patchCatalogQueryData(
      {
        pages: [{ products: [product, other], pagination: { page: 1 } }],
        pageParams: [1],
      },
      "42",
      (row) => ({ ...row, reviewCount: 2 }),
    );

    expect(patched.pages[0].products).toEqual([
      { _id: "42", productName: "A", averageRating: 0, reviewCount: 2 },
      other,
    ]);
  });
});
