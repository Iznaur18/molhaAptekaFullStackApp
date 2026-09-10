import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { myProductsExcludeHiddenOneCFilter } =
  await import("../services/product/myProductsOneCVisibility.js");

describe("myProductsExcludeHiddenOneCFilter", () => {
  it("исключает held и unavailable только для 1С", () => {
    assert.deepEqual(myProductsExcludeHiddenOneCFilter.$nor, [
      { productFromOneC: true, product1cHeld: true },
      { productFromOneC: true, productIsAvailable: false },
    ]);
  });
});
