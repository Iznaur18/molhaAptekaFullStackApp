import { describe, expect, it } from "vitest";

import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
} from "./getProductModerationUi.js";

describe("canSellerEditProduct", () => {
  it("allows edit for pending / approved / rejected", () => {
    expect(canSellerEditProduct({ productModerationStatus: "pending" })).toBe(true);
    expect(canSellerEditProduct({ productModerationStatus: "approved" })).toBe(true);
    expect(canSellerEditProduct({ productModerationStatus: "rejected" })).toBe(true);
  });
});

describe("canSellerDeleteProduct / visibility", () => {
  it("allows delete for pending / approved / rejected", () => {
    expect(canSellerDeleteProduct({ productModerationStatus: "pending" })).toBe(true);
    expect(canSellerDeleteProduct({ productModerationStatus: "approved" })).toBe(true);
    expect(canSellerDeleteProduct({ productModerationStatus: "rejected" })).toBe(true);
  });

  it("visibility stays approved-only", () => {
    expect(
      canSellerToggleCatalogVisibility({ productModerationStatus: "pending" }),
    ).toBe(false);
    expect(
      canSellerToggleCatalogVisibility({ productModerationStatus: "approved" }),
    ).toBe(true);
  });
});
