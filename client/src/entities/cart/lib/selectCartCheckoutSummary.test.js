import { describe, expect, it } from "vitest";

import { groupCartLinesByFulfillment } from "./groupCartLinesByFulfillment.js";
import { getCartLineExclusionReason } from "./getCartLineExclusionReason.js";
import { pruneCartDeselection } from "./pruneCartDeselection.js";
import { selectCartCheckoutSummary } from "./selectCartCheckoutSummary.js";

describe("pruneCartDeselection", () => {
  it("keeps only ids that remain purchasable", () => {
    const prev = new Set(["a", "b", "gone"]);
    const next = pruneCartDeselection(prev, new Set(["a", "b", "c"]));
    expect([...next].sort()).toEqual(["a", "b"]);
  });
});

describe("getCartLineExclusionReason", () => {
  it("does not block delivery-only lines without pickup address", () => {
    const reason = getCartLineExclusionReason(
      {
        productId: "d1",
        quantity: 1,
        lineTotal: 100,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupEnabled: false,
          productDeliveryEnabled: true,
          productPickupAddress: "",
        },
      },
      "buyer",
    );
    expect(reason).toBeNull();
  });

  it("blocks pickup lines without address", () => {
    const reason = getCartLineExclusionReason(
      {
        productId: "p1",
        quantity: 1,
        lineTotal: 100,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "",
        },
      },
      "buyer",
    );
    expect(reason).toBe("missing_pickup");
  });
});

describe("groupCartLinesByFulfillment", () => {
  it("puts dual and pickup-only in pickup; delivery-only in delivery", () => {
    const lines = [
      {
        productId: "pickup",
        quantity: 1,
        lineTotal: 10,
        isMissing: false,
        product: {
          productPickupEnabled: true,
          productDeliveryEnabled: false,
          productPickupAddress: "Addr",
        },
      },
      {
        productId: "dual",
        quantity: 1,
        lineTotal: 20,
        isMissing: false,
        product: {
          productPickupEnabled: true,
          productDeliveryEnabled: true,
          productPickupAddress: "Addr",
        },
      },
      {
        productId: "delivery",
        quantity: 1,
        lineTotal: 30,
        isMissing: false,
        product: {
          productPickupEnabled: false,
          productDeliveryEnabled: true,
        },
      },
    ];

    const grouped = groupCartLinesByFulfillment(lines);
    expect(grouped.pickupLines.map((line) => line.productId)).toEqual([
      "pickup",
      "dual",
    ]);
    expect(grouped.deliveryLines.map((line) => line.productId)).toEqual([
      "delivery",
    ]);
  });
});

describe("selectCartCheckoutSummary", () => {
  it("sums selected purchasable lines and flags partial selection", () => {
    const lines = [
      {
        productId: "a",
        quantity: 1,
        lineTotal: 100,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
        },
      },
      {
        productId: "b",
        quantity: 2,
        lineTotal: 200,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
        },
      },
    ];

    const summary = selectCartCheckoutSummary(lines, "buyer", new Set(["b"]));
    expect(summary.selectedLines.map((line) => line.productId)).toEqual(["a"]);
    expect(summary.selectedTotal).toBe(100);
    expect(summary.selectedDiscount).toBe(0);
    expect(summary.fullTotal).toBe(300);
    expect(summary.hasPartialSelection).toBe(true);
  });

  it("sums catalog discount for selected lines", () => {
    const lines = [
      {
        productId: "a",
        quantity: 2,
        lineTotal: 1600,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
          productPrice: 800,
          productOldPrice: 1000,
        },
      },
      {
        productId: "b",
        quantity: 1,
        lineTotal: 500,
        isMissing: false,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
          productPrice: 500,
          productOldPrice: null,
        },
      },
    ];

    const summary = selectCartCheckoutSummary(lines, "buyer");
    expect(summary.selectedDiscount).toBe(400);
    expect(summary.selectedListTotal).toBe(2500);
    expect(summary.selectedWholesaleDiscount).toBe(0);
  });

  it("sums wholesale discount for selected lines", () => {
    const lines = [
      {
        productId: "a",
        quantity: 5,
        unitPrice: 800,
        lineTotal: 4000,
        isMissing: false,
        isWholesaleApplied: true,
        wholesaleSavings: 1000,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
          productPrice: 1000,
        },
      },
      {
        productId: "b",
        quantity: 1,
        unitPrice: 500,
        lineTotal: 500,
        isMissing: false,
        isWholesaleApplied: false,
        wholesaleSavings: 0,
        product: {
          productIsAvailable: true,
          productSellerId: "s1",
          productPickupAddress: "Москва, Тверская 1",
          productPrice: 500,
        },
      },
    ];

    const summary = selectCartCheckoutSummary(lines, "buyer", new Set(["b"]));
    expect(summary.selectedWholesaleDiscount).toBe(1000);
    expect(summary.selectedTotal).toBe(4000);
  });
});
