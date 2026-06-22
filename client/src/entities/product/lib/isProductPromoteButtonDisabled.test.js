import { describe, expect, it } from "vitest";

import { isProductPromoteButtonDisabled } from "./isProductPromoteButtonDisabled.js";

describe("isProductPromoteButtonDisabled", () => {
  it("keeps promote available for visible and hidden products", () => {
    expect(isProductPromoteButtonDisabled({})).toBe(false);
    expect(
      isProductPromoteButtonDisabled({
        isDeletePending: false,
        isAvailabilityTogglePending: false,
        isAuctionTogglePending: false,
      }),
    ).toBe(false);
  });

  it("disables promote while seller actions are pending", () => {
    expect(
      isProductPromoteButtonDisabled({
        isDeletePending: true,
      }),
    ).toBe(true);

    expect(
      isProductPromoteButtonDisabled({
        isAvailabilityTogglePending: true,
      }),
    ).toBe(true);

    expect(
      isProductPromoteButtonDisabled({
        isAuctionTogglePending: true,
      }),
    ).toBe(true);
  });
});
