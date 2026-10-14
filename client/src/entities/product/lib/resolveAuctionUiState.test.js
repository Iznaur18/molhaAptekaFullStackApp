import { describe, expect, it } from "vitest";

import { resolveAuctionUiState } from "./resolveAuctionUiState.js";

const auctionProduct = {
  _id: "p1",
  productAuctionEnabled: true,
  productModerationStatus: "approved",
  productIsAvailable: true,
};

describe("resolveAuctionUiState: тип сделки", () => {
  it("у обычного товара аукцион активен и вкладка есть", () => {
    const state = resolveAuctionUiState(auctionProduct);

    expect(state.enabled).toBe(true);
    expect(state.auctionActive).toBe(true);
  });

  it.each(["viewing", "service"])(
    "у «%s» аукциона нет — ни вкладки, ни ставок",
    (productDealType) => {
      const state = resolveAuctionUiState({
        ...auctionProduct,
        productDealType,
        auctionActive: true,
      });

      expect(state.enabled).toBe(false);
      expect(state.auctionActive).toBe(false);
      expect(state.showSellerAuctionTab).toBe(false);
    },
  );
});
