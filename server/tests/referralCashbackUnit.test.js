import assert from "node:assert/strict";
import test from "node:test";

import { REFERRAL_CASHBACK_PERCENT } from "../constants/referralConstants.js";
import { computeReferralCashbackAmount } from "../services/referral/computeReferralCashbackAmount.js";
import { generateReferralCode } from "../services/referral/generateReferralCode.js";
import {
  REFERRAL_CODE_LENGTH,
  REFERRAL_CODE_PATTERN,
} from "../constants/referralConstants.js";

test("computeReferralCashbackAmount: 10% floor", () => {
  assert.equal(REFERRAL_CASHBACK_PERCENT, 10);
  assert.equal(computeReferralCashbackAmount(100), 10);
  assert.equal(computeReferralCashbackAmount(149), 14);
  assert.equal(computeReferralCashbackAmount(9), 0);
  assert.equal(computeReferralCashbackAmount(0), 0);
  assert.equal(computeReferralCashbackAmount(-5), 0);
});

test("generateReferralCode: length and alphabet", () => {
  const code = generateReferralCode();
  assert.equal(code.length, REFERRAL_CODE_LENGTH);
  assert.match(code, REFERRAL_CODE_PATTERN);
});
