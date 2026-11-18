import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCuratedCategoryItemKey,
  CURATED_CATEGORY_ITEM_KINDS,
  parseCuratedCategoryItemKey,
} from "../src/curatedCategoryList.js";

test("CURATED_CATEGORY_ITEM_KINDS includes user", () => {
  assert.deepEqual(CURATED_CATEGORY_ITEM_KINDS, ["tree", "personal", "user"]);
});

test("build/parse curated category item key for user", () => {
  const key = buildCuratedCategoryItemKey("user", "507f1f77bcf86cd799439011");
  assert.equal(key, "user:507f1f77bcf86cd799439011");
  assert.deepEqual(parseCuratedCategoryItemKey(key), {
    kind: "user",
    refId: "507f1f77bcf86cd799439011",
  });
});
