import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAffiliateManageToggleBody,
  resolveAffiliateToggleSourceProduct,
} from "../dist/buildAffiliateManageToggleBody.js";

test("resolveAffiliateToggleSourceProduct picks first matching candidate", () => {
  const product = { _id: "abc", affiliatePercent: 12 };
  const resolved = resolveAffiliateToggleSourceProduct("abc", [
    null,
    { _id: "other", affiliatePercent: 5 },
    product,
  ]);
  assert.equal(resolved, product);
  assert.deepEqual(buildAffiliateManageToggleBody(resolved, true), {
    affiliateEnabled: true,
    affiliatePercent: 12,
  });
});

test("resolveAffiliateToggleSourceProduct null → enable percent 0", () => {
  const resolved = resolveAffiliateToggleSourceProduct("missing", [
    { _id: "x", affiliatePercent: 10 },
  ]);
  assert.equal(resolved, null);
  assert.deepEqual(buildAffiliateManageToggleBody(resolved, true), {
    affiliateEnabled: true,
    affiliatePercent: 0,
  });
});
