import assert from "node:assert/strict";
import test from "node:test";

import {
  computeAffiliatePayoutAmount,
  formatAffiliateEnableInsufficientLoyaltyMessage,
  getAffiliateEnableAvailableLoyaltyPoints,
  resolveAffiliateEnableLoyaltyGate,
} from "../dist/affiliateEnableLoyalty.js";

test("computeAffiliatePayoutAmount floors percent of price", () => {
  assert.equal(computeAffiliatePayoutAmount(1000, 10), 100);
  assert.equal(computeAffiliatePayoutAmount(999, 10), 99);
  assert.equal(computeAffiliatePayoutAmount(50, 1), 0);
});

test("getAffiliateEnableAvailableLoyaltyPoints = balance − reserved", () => {
  assert.equal(getAffiliateEnableAvailableLoyaltyPoints(100, 40), 60);
  assert.equal(getAffiliateEnableAvailableLoyaltyPoints(10, 50), 0);
});

test("resolveAffiliateEnableLoyaltyGate blocks when free points < 1-unit payout", () => {
  const blocked = resolveAffiliateEnableLoyaltyGate({
    productPrice: 1000,
    affiliatePercent: 10,
    loyaltyPointsBalance: 50,
    loyaltyPointsReserved: 0,
  });
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.equal(blocked.required, 100);
    assert.equal(blocked.available, 50);
    assert.equal(
      blocked.message,
      formatAffiliateEnableInsufficientLoyaltyMessage(100, 50),
    );
  }
});

test("resolveAffiliateEnableLoyaltyGate allows when enough free points", () => {
  const ok = resolveAffiliateEnableLoyaltyGate({
    productPrice: 1000,
    affiliatePercent: 10,
    loyaltyPointsBalance: 150,
    loyaltyPointsReserved: 40,
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.required, 100);
  assert.equal(ok.available, 110);
});

test("resolveAffiliateEnableLoyaltyGate allows zero required payout", () => {
  const ok = resolveAffiliateEnableLoyaltyGate({
    productPrice: 50,
    affiliatePercent: 1,
    loyaltyPointsBalance: 0,
    loyaltyPointsReserved: 0,
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.required, 0);
});
