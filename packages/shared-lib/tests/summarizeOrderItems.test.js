import assert from "node:assert/strict";
import { test } from "node:test";

import { projectMyOrderSellerBlocks, summarizeOrderItems } from "../dist/index.js";

const line = (overrides) => ({
  status: "pending",
  quantity: 1,
  unitPriceAtOrder: 1000,
  ...overrides,
});

test("свод считает штуки и сумму по живым позициям", () => {
  assert.deepEqual(
    summarizeOrderItems([line({ quantity: 2 }), line({ unitPriceAtOrder: 500 })]),
    { quantity: 3, totalAmount: 2500 },
  );
});

test("отменённая позиция уходит и из количества, и из суммы", () => {
  assert.deepEqual(
    summarizeOrderItems([
      line({ quantity: 2 }),
      line({ quantity: 3, status: "cancelled" }),
    ]),
    { quantity: 2, totalAmount: 2000 },
  );
});

test("возвращённая позиция тоже не оплачивается", () => {
  assert.deepEqual(summarizeOrderItems([line({ status: "returned" }), line({})]), {
    quantity: 1,
    totalAmount: 1000,
  });
});

test("полностью отменённый заказ сводится в ноль", () => {
  assert.deepEqual(summarizeOrderItems([line({ status: "cancelled" })]), {
    quantity: 0,
    totalAmount: 0,
  });
});

test("бесплатные штуки «Бесплатно от N» считаются в количестве, но не в сумме", () => {
  assert.deepEqual(
    summarizeOrderItems([line({ quantity: 3, buyNFreeUnitsAtOrder: 1 })]),
    { quantity: 3, totalAmount: 2000 },
  );
});

test("пустой список и мусор не ломают свод", () => {
  assert.deepEqual(summarizeOrderItems([]), { quantity: 0, totalAmount: 0 });
  assert.deepEqual(summarizeOrderItems(null), { quantity: 0, totalAmount: 0 });
  assert.deepEqual(summarizeOrderItems([{}]), { quantity: 0, totalAmount: 0 });
});

test("блок продавца показывает сумму без отменённой позиции", () => {
  const seller = { _id: "seller-a" };
  const [block] = projectMyOrderSellerBlocks({
    _id: "ord-1",
    totalAmount: 3000,
    items: [
      line({ quantity: 2, productId: { _id: "p1", productSeller: seller } }),
      line({ status: "cancelled", productId: { _id: "p2", productSeller: seller } }),
    ],
  });

  assert.equal(block.order.totalAmount, 2000);
});
