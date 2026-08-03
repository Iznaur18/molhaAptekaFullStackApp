import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCatalogProductsCacheKey } from "../services/product/catalogProductsResponseCache.js";

describe("buildCatalogProductsCacheKey", () => {
  it("changes key when near point changes", () => {
    const query = { near: true, page: 1 };
    const a = buildCatalogProductsCacheKey({
      userId: "u1",
      query,
      nearPoint: "55.75000,37.62000",
    });
    const b = buildCatalogProductsCacheKey({
      userId: "u1",
      query,
      nearPoint: "55.76000,37.62000",
    });
    assert.notEqual(a, b);
  });

  it("keeps anon key stable without near point", () => {
    const key = buildCatalogProductsCacheKey({
      query: { sort: "newest" },
    });
    assert.equal(key, 'anon:{"sort":"newest"}');
  });
});
