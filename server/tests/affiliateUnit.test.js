import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE,
  computeAffiliatePayoutAmount,
} from "../constants/affiliateConstants.js";
import { resolveOrderLineAffiliateAttribution } from "../services/affiliate/resolveAffiliateAttribution.js";

describe("computeAffiliatePayoutAmount", () => {
  it("floors percent of paid line", () => {
    assert.equal(computeAffiliatePayoutAmount(1000, 10), 100);
    assert.equal(computeAffiliatePayoutAmount(999, 10), 99);
    assert.equal(computeAffiliatePayoutAmount(50, 1), 0);
  });

  it("returns 0 for invalid inputs", () => {
    assert.equal(computeAffiliatePayoutAmount(0, 10), 0);
    assert.equal(computeAffiliatePayoutAmount(100, 0), 0);
    assert.equal(computeAffiliatePayoutAmount(NaN, 10), 0);
  });
});

describe("affiliate loyalty funding copy", () => {
  it("points sellers to loyalty points not separate budget", () => {
    assert.match(AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE, /балл/i);
    assert.doesNotMatch(AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE, /бюджет/i);
  });
});

describe("resolveOrderLineAffiliateAttribution", () => {
  it("sets pending for valid referrer", () => {
    assert.deepEqual(
      resolveOrderLineAffiliateAttribution({
        referrerUserId: "aff1",
        buyerUserId: "buyer1",
        sellerUserId: "seller1",
        affiliateEnabled: true,
        affiliatePercent: 10,
      }),
      { affiliateReferrerUserId: "aff1", affiliateStatus: "pending" },
    );
  });

  it("blocks self / seller / disabled", () => {
    assert.equal(
      resolveOrderLineAffiliateAttribution({
        referrerUserId: "buyer1",
        buyerUserId: "buyer1",
        sellerUserId: "seller1",
        affiliateEnabled: true,
        affiliatePercent: 10,
      }).affiliateStatus,
      "none",
    );
    assert.equal(
      resolveOrderLineAffiliateAttribution({
        referrerUserId: "seller1",
        buyerUserId: "buyer1",
        sellerUserId: "seller1",
        affiliateEnabled: true,
        affiliatePercent: 10,
      }).affiliateStatus,
      "none",
    );
    assert.equal(
      resolveOrderLineAffiliateAttribution({
        referrerUserId: "aff1",
        buyerUserId: "buyer1",
        sellerUserId: "seller1",
        affiliateEnabled: false,
        affiliatePercent: 10,
      }).affiliateStatus,
      "none",
    );
  });
});
