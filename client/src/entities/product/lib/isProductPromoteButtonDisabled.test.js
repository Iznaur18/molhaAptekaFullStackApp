import { describe, expect, it } from "vitest";

import { isProductPromoteButtonDisabled } from "./isProductPromoteButtonDisabled.js";

describe("isProductPromoteButtonDisabled", () => {
  it("keeps promote available while catalog promotion is active", () => {
    expect(
      isProductPromoteButtonDisabled({
        productIsAvailable: true,
      }),
    ).toBe(false);
  });

  it("disables promote when product is hidden from catalog", () => {
    expect(
      isProductPromoteButtonDisabled({
        productIsAvailable: false,
      }),
    ).toBe(true);
  });

  it("disables promote while seller actions are pending", () => {
    expect(
      isProductPromoteButtonDisabled({
        productIsAvailable: true,
        isDeletePending: true,
      }),
    ).toBe(true);

    expect(
      isProductPromoteButtonDisabled({
        productIsAvailable: true,
        isAvailabilityTogglePending: true,
      }),
    ).toBe(true);

    expect(
      isProductPromoteButtonDisabled({
        productIsAvailable: true,
        isAuctionTogglePending: true,
      }),
    ).toBe(true);
  });
});
