import { describe, expect, it } from "vitest";

import {
  isProfileProductThumbClickBlocked,
  isProfileProductThumbUnavailable,
} from "./resolveProfileProductThumbState.js";

describe("isProfileProductThumbUnavailable", () => {
  const baseItem = {
    productId: "p1",
    productName: "Test",
    viewable: true,
    product: { _id: "p1", productOutOfStock: false, isSellerClosedNow: false },
  };

  it("returns true when not viewable", () => {
    expect(isProfileProductThumbUnavailable({ ...baseItem, viewable: false })).toBe(
      true,
    );
  });

  it("skips purchase gates for profile owner", () => {
    expect(
      isProfileProductThumbUnavailable(
        {
          ...baseItem,
          product: {
            ...baseItem.product,
            productOutOfStock: true,
            isBlockedBySeller: true,
            isSellerClosedNow: true,
          },
        },
        { isSelf: true },
      ),
    ).toBe(false);
  });

  it("blocks when seller blocked viewer", () => {
    expect(
      isProfileProductThumbUnavailable({
        ...baseItem,
        product: { ...baseItem.product, isBlockedBySeller: true },
      }),
    ).toBe(true);
  });

  it("blocks when out of stock", () => {
    expect(
      isProfileProductThumbUnavailable({
        ...baseItem,
        product: { ...baseItem.product, productOutOfStock: true },
      }),
    ).toBe(true);
  });

  it("blocks when seller closed now", () => {
    expect(
      isProfileProductThumbUnavailable({
        ...baseItem,
        product: { ...baseItem.product, isSellerClosedNow: true },
      }),
    ).toBe(true);
  });
});

describe("isProfileProductThumbClickBlocked", () => {
  const baseItem = {
    productId: "p1",
    productName: "Test",
    viewable: true,
    product: { _id: "p1", productOutOfStock: false, isSellerClosedNow: false },
  };

  it("allows admin click on out of stock", () => {
    expect(
      isProfileProductThumbClickBlocked(
        {
          ...baseItem,
          product: { ...baseItem.product, productOutOfStock: true },
        },
        { isAdminViewer: true },
      ),
    ).toBe(false);
  });

  it("allows admin click when seller closed", () => {
    expect(
      isProfileProductThumbClickBlocked(
        {
          ...baseItem,
          product: { ...baseItem.product, isSellerClosedNow: true },
        },
        { isAdminViewer: true },
      ),
    ).toBe(false);
  });

  it("blocks admin when seller blocked viewer", () => {
    expect(
      isProfileProductThumbClickBlocked(
        {
          ...baseItem,
          product: { ...baseItem.product, isBlockedBySeller: true },
        },
        { isAdminViewer: true },
      ),
    ).toBe(true);
  });
});
