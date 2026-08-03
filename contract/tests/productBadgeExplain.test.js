import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PRODUCT_BADGE_EXPLAIN_KEY_VALUES,
  adminProductBadgeExplainPatchBodySchema,
  productBadgeExplainKeyParamsSchema,
} from "../src/productBadgeExplain.js";

test("productBadgeExplainKeyParamsSchema accepts known key", () => {
  const parsed = productBadgeExplainKeyParamsSchema.parse({ badgeKey: "original" });
  assert.equal(parsed.badgeKey, "original");
});

test("productBadgeExplainKeyParamsSchema rejects unknown key", () => {
  assert.throws(() =>
    productBadgeExplainKeyParamsSchema.parse({ badgeKey: "nope" }),
  );
});

test("adminProductBadgeExplainPatchBodySchema accepts description + imageUrl", () => {
  const parsed = adminProductBadgeExplainPatchBodySchema.parse({
    imageUrl: "/uploads/a.png",
    description: "Текст",
  });
  assert.equal(parsed.description, "Текст");
  assert.equal(PRODUCT_BADGE_EXPLAIN_KEY_VALUES.length, 15);
});
