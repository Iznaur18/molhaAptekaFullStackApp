import { describe, expect, it } from "vitest";

import { pruneCartDeselection } from "./pruneCartDeselection.js";
import { selectCartCheckoutSummary } from "./selectCartCheckoutSummary.js";

describe("pruneCartDeselection", () => {
  it("keeps only ids that remain purchasable", () => {
    const prev = new Set(["a", "b", "gone"]);
    const next = pruneCartDeselection(prev, new Set(["a", "b", "c"]));
    expect([...next].sort()).toEqual(["a", "b"]);
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
        product: { productIsAvailable: true, productSellerId: "s1" },
      },
      {
        productId: "b",
        quantity: 2,
        lineTotal: 200,
        isMissing: false,
        product: { productIsAvailable: true, productSellerId: "s1" },
      },
    ];

    const summary = selectCartCheckoutSummary(lines, "buyer", new Set(["b"]));
    expect(summary.selectedLines.map((line) => line.productId)).toEqual(["a"]);
    expect(summary.selectedTotal).toBe(100);
    expect(summary.fullTotal).toBe(300);
    expect(summary.hasPartialSelection).toBe(true);
  });
});
