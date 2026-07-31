import { describe, expect, it } from "vitest";

import { resolveOrderLineAffiliateSellerLine } from "@izibuy/shared-lib";

describe("resolveOrderLineAffiliateSellerLine", () => {
  it("hides for buyer", () => {
    expect(
      resolveOrderLineAffiliateSellerLine({
        attentionRole: "buyer",
        item: {
          affiliateStatus: "paid",
          affiliateReferrerUserId: { userName: "Ivan" },
          affiliateAmount: 50,
          affiliatePercentUsed: 10,
        },
      }),
    ).toBeNull();
  });

  it("formats paid line for seller", () => {
    expect(
      resolveOrderLineAffiliateSellerLine({
        attentionRole: "seller",
        item: {
          affiliateStatus: "paid",
          affiliateReferrerUserId: { userName: "Ivan" },
          affiliateAmount: 50,
          affiliatePercentUsed: 10,
        },
      }),
    ).toBe("Привёл: Ivan · 10% · 50");
  });

  it("formats pending", () => {
    expect(
      resolveOrderLineAffiliateSellerLine({
        attentionRole: "seller",
        item: {
          affiliateStatus: "pending",
          affiliateReferrerUserId: { userName: "Ann" },
        },
      }),
    ).toBe("Привёл: Ann · выплата после подтверждения");
  });
});
