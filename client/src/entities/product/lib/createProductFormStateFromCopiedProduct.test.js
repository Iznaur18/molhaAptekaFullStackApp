import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM, createProductFormStateFromCopiedProduct } from "./createProductFormState.js";

describe("createProductFormStateFromCopiedProduct", () => {
  it("copies listing fields and strips manage extras", () => {
    const form = createProductFormStateFromCopiedProduct({
      productName: "PS5",
      productDescription: "desc",
      productPrice: 50000,
      productOldPrice: 78000,
      productImageUrls: ["https://cdn.example/a.jpg"],
      productPreviewVideoUrl: "https://cdn.example/v.mp4",
      affiliateEnabled: true,
      affiliatePercent: 25,
      productIsAvailable: false,
      productStockQuantity: 3,
      productAuctionEnabled: true,
      productInstallmentEnabled: true,
      productWholesaleEnabled: true,
      productRentalEnabled: true,
      productQaEnabled: true,
      productIsOriginal: true,
      productListingOrigin: "own",
    });

    expect(form.productName).toBe("PS5");
    expect(form.productPrice.replace(/\s/g, "")).toBe("50000");
    expect(form.productStockQuantity).toBe("3");
    expect(form.productIsOriginal).toBe(true);
    expect(form.productListingOrigin).toBe("own");
    expect(form.productImageRows.map((row) => row.url)).toEqual([
      "https://cdn.example/a.jpg",
    ]);
    expect(form.productPreviewVideoUrl).toBe("https://cdn.example/v.mp4");
    expect(form.affiliateEnabled).toBe(false);
    expect(form.affiliatePercent).toBe(CREATE_PRODUCT_INITIAL_FORM.affiliatePercent);
    expect(form.productIsAvailable).toBe(true);
    expect(form.productAuctionEnabled).toBeUndefined();
    expect(form.productInstallmentEnabled).toBeUndefined();
  });
});
