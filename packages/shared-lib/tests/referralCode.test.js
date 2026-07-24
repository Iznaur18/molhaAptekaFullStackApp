import assert from "node:assert/strict";
import test from "node:test";

import {
  REFERRAL_CODE_STORAGE_KEY,
  REFERRAL_QUERY_PARAM,
  normalizeReferralCode,
} from "../dist/index.js";

test("normalizeReferralCode: trims and uppercases", () => {
  assert.equal(normalizeReferralCode("  ab12cd34  "), "AB12CD34");
  assert.equal(normalizeReferralCode(null), "");
});

test("referral storage constants are stable", () => {
  assert.equal(REFERRAL_QUERY_PARAM, "ref");
  assert.equal(REFERRAL_CODE_STORAGE_KEY, "izibuy_referral_code");
});
