import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  projectMyOrderSellerBlocks,
  resolveOrderLineSellerId,
} from "../dist/index.js";

const SELLER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const SELLER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

/** @param {string} sellerId @param {object} [extra] */
const line = (sellerId, extra = {}) => ({
  sellerIdAtOrder: sellerId,
  productId: { _id: "p1", productSeller: { _id: sellerId } },
  quantity: 1,
  unitPriceAtOrder: 100,
  status: "pending",
  ...extra,
});

describe("продавец позиции", () => {
  it("берётся из денормализованного поля", () => {
    assert.equal(resolveOrderLineSellerId(line(SELLER_A)), SELLER_A);
  });

  it("переживает удалённый товар", () => {
    assert.equal(
      resolveOrderLineSellerId({ sellerIdAtOrder: SELLER_A, productId: null }),
      SELLER_A,
      "populate пуст, но продавец записан в позиции",
    );
  });

  it("падает на populate у заказов до денормализации", () => {
    assert.equal(
      resolveOrderLineSellerId({
        productId: { productSeller: { _id: SELLER_B } },
      }),
      SELLER_B,
    );
  });

  it("без обоих источников — неизвестный продавец", () => {
    assert.equal(resolveOrderLineSellerId({ productId: null }), "__unknown__");
  });
});

describe("способ получения блока покупателя", () => {
  const mixedOrder = {
    _id: "o1",
    fulfillmentMethod: "delivery",
    shipments: [
      { sellerId: SELLER_A, fulfillmentMethod: "pickup" },
      { sellerId: SELLER_B, fulfillmentMethod: "delivery" },
    ],
    items: [line(SELLER_A), line(SELLER_B)],
  };

  it("каждый блок показывает свой способ, а не способ всего заказа", () => {
    const blocks = projectMyOrderSellerBlocks(mixedOrder);
    const byId = Object.fromEntries(
      blocks.map((b) => [b.sellerId, b.order.fulfillmentMethod]),
    );

    assert.equal(byId[SELLER_A], "pickup", "эту половину покупатель забирает сам");
    assert.equal(byId[SELLER_B], "delivery");
  });

  it("заказ до отправлений читается по общему способу", () => {
    const legacy = {
      _id: "o2",
      fulfillmentMethod: "delivery",
      items: [line(SELLER_A)],
    };

    assert.equal(
      projectMyOrderSellerBlocks(legacy)[0].order.fulfillmentMethod,
      "delivery",
    );
  });

  it("неизвестное значение считается самовывозом", () => {
    const weird = { _id: "o3", fulfillmentMethod: "телепорт", items: [line(SELLER_A)] };

    assert.equal(
      projectMyOrderSellerBlocks(weird)[0].order.fulfillmentMethod,
      "pickup",
    );
  });

  it("статус и сумма по-прежнему считаются по своим позициям", () => {
    const blocks = projectMyOrderSellerBlocks({
      _id: "o4",
      fulfillmentMethod: "pickup",
      items: [
        line(SELLER_A, { status: "shipped" }),
        line(SELLER_B, { status: "pending", unitPriceAtOrder: 250 }),
      ],
    });
    const byId = Object.fromEntries(blocks.map((b) => [b.sellerId, b.order]));

    assert.equal(byId[SELLER_A].status, "shipped");
    assert.equal(byId[SELLER_B].status, "pending");
    assert.equal(byId[SELLER_B].totalAmount, 250);
  });
});
