import { describe, expect, it } from "vitest";

import { resolveOrderActiveAmountRub } from "./resolveOrderActiveAmountRub.js";
import { summarizeMyOrders } from "./summarizeMyOrders.js";

describe("resolveOrderActiveAmountRub", () => {
  it("returns 0 for fully cancelled order", () => {
    expect(
      resolveOrderActiveAmountRub({
        status: "cancelled",
        totalAmount: 5000,
        items: [{ status: "cancelled", quantity: 1, unitPriceAtOrder: 5000 }],
      }),
    ).toBe(0);
  });

  it("excludes cancelled line items from mixed order", () => {
    expect(
      resolveOrderActiveAmountRub({
        status: "pending",
        totalAmount: 3000,
        items: [
          { status: "pending", quantity: 1, unitPriceAtOrder: 2000 },
          { status: "cancelled", quantity: 1, unitPriceAtOrder: 1000 },
        ],
      }),
    ).toBe(2000);
  });

  it("falls back to totalAmount when items missing", () => {
    expect(resolveOrderActiveAmountRub({ status: "pending", totalAmount: 1500 })).toBe(1500);
  });
});

describe("summarizeMyOrders", () => {
  it("does not add cancelled orders to purchase sum", () => {
    const summary = summarizeMyOrders([
      {
        status: "pending",
        totalAmount: 2000,
        items: [{ status: "pending", quantity: 1, unitPriceAtOrder: 2000 }],
      },
      {
        status: "cancelled",
        totalAmount: 9000,
        items: [{ status: "cancelled", quantity: 1, unitPriceAtOrder: 9000 }],
      },
    ]);

    expect(summary.totalAmountRub).toBe(2000);
  });
});
