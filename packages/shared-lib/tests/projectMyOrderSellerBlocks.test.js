import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MY_ORDER_UNKNOWN_SELLER_ID,
  buildOrderStatusFromItems,
  projectMyOrderSellerBlocks,
  projectMyOrdersSellerBlocks,
} from "../dist/index.js";

const sellerA = { _id: "seller-a", userName: "A" };
const sellerB = { _id: "seller-b", userName: "B" };

test("buildOrderStatusFromItems uses completed-tier rollup like server", () => {
  assert.equal(
    buildOrderStatusFromItems([
      { status: "confirmed" },
      { status: "shipped" },
    ]),
    "shipped",
  );
  assert.equal(
    buildOrderStatusFromItems([{ status: "confirmed" }, { status: "confirmed" }]),
    "confirmed",
  );
  assert.equal(
    buildOrderStatusFromItems([{ status: "shipped" }, { status: "delivered" }]),
    "shipped",
  );
  assert.equal(
    buildOrderStatusFromItems([{ status: "confirmed" }, { status: "pending" }]),
    "pending",
  );
});

test("projectMyOrderSellerBlocks splits multi-seller checkout and rollups per seller", () => {
  const order = {
    _id: "ord-1",
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
        quantity: 2,
        unitPriceAtOrder: 1000,
        productId: { _id: "p2", productSeller: sellerB },
      },
    ],
  };

  const blocks = projectMyOrderSellerBlocks(order);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].blockKey, "ord-1:seller-a");
  assert.equal(blocks[0].order.status, "confirmed");
  assert.equal(blocks[0].order.totalAmount, 1000);
  assert.equal(blocks[0].order.items.length, 1);
  assert.equal(blocks[0].order._id, "ord-1");

  assert.equal(blocks[1].blockKey, "ord-1:seller-b");
  assert.equal(blocks[1].order.status, "shipped");
  assert.equal(blocks[1].order.totalAmount, 2000);
  assert.equal(blocks[1].order.items[0].itemIndex, 1);
});

test("projectMyOrdersSellerBlocks flattens and keeps unknown seller bucket", () => {
  const blocks = projectMyOrdersSellerBlocks([
    {
      _id: "ord-2",
      items: [
        {
          status: "pending",
          quantity: 1,
          unitPriceAtOrder: 500,
          productId: "legacy-id",
        },
      ],
    },
  ]);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].sellerId, MY_ORDER_UNKNOWN_SELLER_ID);
  assert.equal(blocks[0].order.status, "pending");
});
