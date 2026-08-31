import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const { stripShipmentCodes } = await import(
  "../services/order/sanitizeShipmentCodes.js"
);

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** @param {string} status */
const makeOrder = (status) => ({
  items: [{ sellerIdAtOrder: SELLER, status }],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      handoverCode: "1111",
      deliveryCode: "2222",
      handoverAttempts: 3,
      deliveryAttempts: 1,
    },
  ],
});

describe("коды передачи в ответах заказа", () => {
  it("покупателю код передачи не показывается никогда", () => {
    const order = stripShipmentCodes(makeOrder("courier_assigned"), "buyer");

    assert.equal(
      order.shipments[0].handoverCode,
      undefined,
      "иначе покупатель назовёт его курьеру, и продавцу нечего подтверждать",
    );
  });

  it("покупателю код вручения открывается только после «Доставлен»", () => {
    assert.equal(
      stripShipmentCodes(makeOrder("in_delivery"), "buyer").shipments[0].deliveryCode,
      undefined,
    );
    assert.equal(
      stripShipmentCodes(makeOrder("delivered"), "buyer").shipments[0].deliveryCode,
      "2222",
    );
  });

  it("продавцу не показывается ни один код", () => {
    const order = stripShipmentCodes(makeOrder("delivered"), "seller");

    assert.equal(order.shipments[0].handoverCode, undefined);
    assert.equal(
      order.shipments[0].deliveryCode,
      undefined,
      "код вручения — дело покупателя и курьера",
    );
  });

  it("счётчики попыток наружу не уходят", () => {
    const order = stripShipmentCodes(makeOrder("delivered"), "buyer");

    assert.equal(order.shipments[0].handoverAttempts, undefined);
    assert.equal(order.shipments[0].deliveryAttempts, undefined);
  });

  it("остальные поля отправления остаются", () => {
    const order = stripShipmentCodes(makeOrder("delivered"), "buyer");

    assert.equal(order.shipments[0].sellerId, SELLER);
    assert.equal(order.shipments[0].fulfillmentMethod, "delivery");
  });

  it("заказ без отправлений не ломается", () => {
    assert.equal(stripShipmentCodes(null, "buyer"), null);
    assert.deepEqual(stripShipmentCodes({ items: [] }, "buyer"), { items: [] });
  });
});
