import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSellerNewOrderNotificationMessage,
  groupNewOrderLinesBySeller,
} from "../services/order/notifySellersAboutNewOrder.js";

test("groupNewOrderLinesBySeller: one seller, one line", () => {
  const grouped = groupNewOrderLinesBySeller({
    buyerUserId: "buyer1",
    productById: {
      p1: { sellerId: "seller1", name: "Товар A" },
    },
    items: [{ productId: "p1", productNameAtOrder: "Товар A" }],
  });

  assert.equal(grouped.size, 1);
  assert.deepEqual(grouped.get("seller1"), { lineCount: 1, names: ["Товар A"] });
});

test("groupNewOrderLinesBySeller: skips buyer self-seller", () => {
  const grouped = groupNewOrderLinesBySeller({
    buyerUserId: "seller1",
    productById: {
      p1: { sellerId: "seller1", name: "Свой товар" },
    },
    items: [{ productId: "p1", productNameAtOrder: "Свой товар" }],
  });

  assert.equal(grouped.size, 0);
});

test("buildSellerNewOrderNotificationMessage: multi-line", () => {
  assert.equal(
    buildSellerNewOrderNotificationMessage({ lineCount: 3, names: ["A", "B"] }),
    "Новый заказ на ваш товар: 3 поз.",
  );
});
