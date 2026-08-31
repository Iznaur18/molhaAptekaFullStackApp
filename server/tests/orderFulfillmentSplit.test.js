import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const { resolveOrderFulfillmentSplit } = await import(
  "../services/order/resolveOrderFulfillmentSplit.js"
);
const { createOrderBodySchema } = await import("@molha/api-contract");

const SELLER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const SELLER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";
const PRODUCT_A = "111111111111111111111111";
const PRODUCT_B = "222222222222222222222222";

const productById = {
  [PRODUCT_A]: { sellerId: SELLER_A },
  [PRODUCT_B]: { sellerId: SELLER_B },
};

/** @param {Record<string, string> | null} bySeller @param {"pickup"|"delivery"} fallback */
const split = (bySeller, fallback = "pickup") =>
  resolveOrderFulfillmentSplit({
    productIds: [PRODUCT_A, PRODUCT_B],
    productById,
    fulfillmentBySellerId: bySeller,
    fallbackFulfillment: fallback,
  });

describe("разделение заказа по способам получения", () => {
  it("без выбора по продавцам всё идёт общим способом", () => {
    const result = split(null, "delivery");

    assert.deepEqual(result.deliveryProductIds, [PRODUCT_A, PRODUCT_B]);
    assert.deepEqual(result.pickupProductIds, []);
    assert.equal(result.orderFulfillmentMethod, "delivery");
  });

  it("смешанный заказ: один продавец самовывозом, другой доставкой", () => {
    const result = split({ [SELLER_A]: "pickup", [SELLER_B]: "delivery" });

    assert.deepEqual(result.pickupProductIds, [PRODUCT_A]);
    assert.deepEqual(result.deliveryProductIds, [PRODUCT_B]);
    assert.ok(result.hasPickup && result.hasDelivery);
  });

  it("доставка сильнее: заказу нужен адрес покупателя", () => {
    const result = split({ [SELLER_A]: "pickup", [SELLER_B]: "delivery" });

    assert.equal(
      result.orderFulfillmentMethod,
      "delivery",
      "иначе адрес не потребуют и везти будет некуда",
    );
  });

  it("чего покупатель не прислал, берётся из общего способа", () => {
    const result = split({ [SELLER_A]: "delivery" }, "pickup");

    assert.deepEqual(result.deliveryProductIds, [PRODUCT_A]);
    assert.deepEqual(result.pickupProductIds, [PRODUCT_B]);
  });

  it("мусор в выборе не проходит молча, а падает на общий способ", () => {
    const result = split({ [SELLER_A]: "самолётом" }, "pickup");

    assert.deepEqual(result.pickupProductIds, [PRODUCT_A, PRODUCT_B]);
  });

  it("способ запоминается на продавце для отправлений", () => {
    const result = split({ [SELLER_A]: "pickup", [SELLER_B]: "delivery" });

    assert.deepEqual(result.fulfillmentBySellerId, {
      [SELLER_A]: "pickup",
      [SELLER_B]: "delivery",
    });
  });
});

describe("валидация тела заказа", () => {
  const baseBody = {
    items: [{ productId: PRODUCT_A, quantity: 1 }],
    paymentMethod: "cashOnDelivery",
    idempotencyKey: "key-1",
  };

  it("смешанный заказ без адреса не проходит", () => {
    const result = createOrderBodySchema.safeParse({
      ...baseBody,
      fulfillmentMethod: "pickup",
      fulfillmentBySellerId: { [SELLER_B]: "delivery" },
    });

    assert.equal(result.success, false);
    assert.ok(
      result.error.issues.some((i) => i.path.includes("deliveryAddress")),
      "адрес обязателен, раз хоть что-то едет к покупателю",
    );
  });

  it("смешанный заказ с адресом проходит", () => {
    const result = createOrderBodySchema.safeParse({
      ...baseBody,
      fulfillmentMethod: "pickup",
      fulfillmentBySellerId: { [SELLER_B]: "delivery" },
      deliveryAddress: "г Москва, ул Зеленоградская, д 23А",
    });

    assert.equal(result.success, true, result.error?.message);
  });

  it("чистый самовывоз адреса по-прежнему не требует", () => {
    const result = createOrderBodySchema.safeParse({
      ...baseBody,
      fulfillmentMethod: "pickup",
      fulfillmentBySellerId: { [SELLER_A]: "pickup" },
    });

    assert.equal(result.success, true, result.error?.message);
  });

  it("неизвестный способ в карте отклоняется", () => {
    const result = createOrderBodySchema.safeParse({
      ...baseBody,
      fulfillmentBySellerId: { [SELLER_A]: "дроном" },
    });

    assert.equal(result.success, false);
  });

  it("без карты тело остаётся валидным — старые клиенты живы", () => {
    const result = createOrderBodySchema.safeParse({
      ...baseBody,
      fulfillmentMethod: "pickup",
    });

    assert.equal(result.success, true, result.error?.message);
    assert.deepEqual(result.data.fulfillmentBySellerId, {});
  });
});
