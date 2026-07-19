import assert from "node:assert/strict";
import test from "node:test";

import {
  collectCategoryLegacySlugs,
  countProductsBlockingCategorySubtree,
  resolveLegacySlugForDetachedProducts,
} from "../utils/productCategoryDeleteHelpers.js";

test("collectCategoryLegacySlugs includes slug and legacyProductCategory", () => {
  const slugs = collectCategoryLegacySlugs({
    slug: "electronics",
    legacyProductCategory: "electronics",
  });

  assert.deepEqual([...slugs].sort(), ["electronics"]);
});

test("collectCategoryLegacySlugs deduplicates slug and legacy", () => {
  const slugs = collectCategoryLegacySlugs({
    slug: "phones",
    legacyProductCategory: "electronics",
  });

  assert.deepEqual([...slugs].sort(), ["electronics", "phones"]);
});

test("resolveLegacySlugForDetachedProducts falls back to leaf slug", async () => {
  const slug = await resolveLegacySlugForDetachedProducts({
    slug: "electronics-phones-mobile-feature",
    pathIds: [],
  });

  assert.equal(slug, "electronics-phones-mobile-feature");
});

test("countProductsBlockingCategorySubtree returns 0 for empty subtree", async () => {
  const count = await countProductsBlockingCategorySubtree([]);
  assert.equal(count, 0);
});
