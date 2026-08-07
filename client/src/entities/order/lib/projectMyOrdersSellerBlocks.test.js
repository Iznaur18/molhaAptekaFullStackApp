import { describe, expect, it } from "vitest";

import { orderMatchesMyOrdersFilters } from "./filterMyOrders.js";
import { projectMyOrdersSellerBlocks } from "./projectMyOrdersSellerBlocks.js";
import { summarizeMyOrders } from "./summarizeMyOrders.js";

const sellerA = { _id: "seller-a", userName: "A" };
const sellerB = { _id: "seller-b", userName: "B" };

const multiSellerOrder = {
  _id: "ord-mix",
  status: "pending",
  totalAmount: 3000,
  items: [
    {
      itemIndex: 0,
      status: "confirmed",
      quantity: 1,
      unitPriceAtOrder: 1000,
      productId: { _id: "p1", productSeller: sellerA },
    },
    {
      itemIndex: 1,
      status: "shipped",
      quantity: 1,
      unitPriceAtOrder: 2000,
      productId: { _id: "p2", productSeller: sellerB },
    },
  ],
};

describe("projectMyOrdersSellerBlocks + my-orders filters", () => {
  it("shows confirmed seller block under confirmed filter while shipped stays separate", () => {
    const blocks = projectMyOrdersSellerBlocks([multiSellerOrder]);
    expect(blocks).toHaveLength(2);

    const confirmed = blocks.filter((block) =>
      orderMatchesMyOrdersFilters(block.order, { status: "confirmed" }),
    );
    expect(confirmed).toHaveLength(1);
    expect(confirmed[0].order.status).toBe("confirmed");
    expect(confirmed[0].order.items).toHaveLength(1);
    expect(confirmed[0].order.items[0].itemIndex).toBe(0);

    const shipped = blocks.filter((block) =>
      orderMatchesMyOrdersFilters(block.order, { status: "shipped" }),
    );
    expect(shipped).toHaveLength(1);
    expect(shipped[0].order.status).toBe("shipped");
  });

  it("counts in-progress / attention per seller block", () => {
    const blocks = projectMyOrdersSellerBlocks([multiSellerOrder]);
    const summary = summarizeMyOrders(blocks.map((block) => block.order));
    expect(summary.inProgressCount).toBe(1);
    expect(summary.attentionCount).toBe(1);
    expect(summary.totalAmountRub).toBe(3000);
  });
});
