import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HARDCODED_PRODUCT_CATEGORY_SLUGS,
  PRODUCT_CATEGORY_TREE_SEED,
} from "../services/product/seedProductCategoryTree.js";

describe("hardcoded product category seed is off for prod", () => {
  it("runtime seed is empty", () => {
    assert.deepEqual(PRODUCT_CATEGORY_TREE_SEED, []);
  });

  it("hardcoded slugs stay available for tests only", () => {
    assert.ok(HARDCODED_PRODUCT_CATEGORY_SLUGS.includes("grocery"));
    assert.ok(HARDCODED_PRODUCT_CATEGORY_SLUGS.includes("electronics"));
    assert.ok(
      HARDCODED_PRODUCT_CATEGORY_SLUGS.includes(
        "electronics-phones-mobile-smartphones",
      ),
    );
  });
});
