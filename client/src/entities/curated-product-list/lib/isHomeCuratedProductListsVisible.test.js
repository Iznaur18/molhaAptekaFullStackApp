import { describe, expect, it } from "vitest";

import { isHomeCuratedProductListsVisible } from "./isHomeCuratedProductListsVisible.js";

const baseParams = {
  isHomeCatalogMainView: true,
  isMineMode: false,
  selectedProductCategory: null,
  selectedCategoryId: null,
  hasProductSearchQuery: false,
  catalogFollowingOnly: false,
  catalogAuctionOnly: false,
  catalogInstallmentOnly: false,
  catalogSaleOnly: false,
  catalogRentalOnly: false,
  catalogAffiliateOnly: false,
  catalogWholesaleOnly: false,
  catalogOriginalOnly: false,
  catalogNear: false,
};

describe("isHomeCuratedProductListsVisible", () => {
  it("shows on clean home catalog", () => {
    expect(isHomeCuratedProductListsVisible(baseParams)).toBe(true);
  });

  it("hides with category tree filter", () => {
    expect(
      isHomeCuratedProductListsVisible({
        ...baseParams,
        selectedCategoryId: "664f1c2a3b4c5d6e7f8a9b0c",
      }),
    ).toBe(false);
  });

  it("hides with seller personal category filter", () => {
    expect(
      isHomeCuratedProductListsVisible({
        ...baseParams,
        sellerPersonalCategoryId: "664f1c2a3b4c5d6e7f8a9b0c",
      }),
    ).toBe(false);
  });

  it("hides with near filter", () => {
    expect(
      isHomeCuratedProductListsVisible({
        ...baseParams,
        catalogNear: true,
      }),
    ).toBe(false);
  });
});
