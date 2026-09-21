import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-cdek-waybill";

const { OrderModel } = await import("../models/index.js");
const { buildCdekOrderBody, createCdekWaybill } =
  await import("../services/shipping/cdek/cdekWaybill.js");

const sellerId = "64b000000000000000000001";
const otherSellerId = "64b000000000000000000002";
const productId = "64c000000000000000000001";

/**
 * @param {Record<string, unknown>} [overrides]
 */
function makeShipment(overrides = {}) {
  return {
    sellerId,
    cdekShipmentAtOrder: {
      tariffCode: 136,
      deliveryMode: 4,
      deliverySumRub: 435,
      pickupPoint: { code: "KZN12" },
      recipient: { name: "Иван Петров", phone: "+79990001122" },
    },
    ...overrides,
  };
}

/**
 * @param {Record<string, unknown>} [overrides]
 */
function makeOrder(overrides = {}) {
  return {
    _id: "650000000000000000000abc",
    paymentMethod: "cashOnDelivery",
    items: [
      {
        productId,
        sellerIdAtOrder: sellerId,
        productNameAtOrder: "айфон 16",
        unitPriceAtOrder: 90000,
        quantity: 2,
      },
      {
        productId: "64c000000000000000000009",
        sellerIdAtOrder: otherSellerId,
        productNameAtOrder: "чужой товар",
        unitPriceAtOrder: 100,
        quantity: 1,
      },
    ],
    ...overrides,
  };
}

const productsById = new Map([
  [
    productId,
    {
      productWeightG: 350,
      productLengthCm: 20,
      productWidthCm: 15,
      productHeightCm: 8,
    },
  ],
]);

describe("buildCdekOrderBody", () => {
  it("склад-склад: пункт приёма, пункт выдачи, получатель и доставка с покупателя", () => {
    const body = buildCdekOrderBody({
      order: makeOrder(),
      shipment: makeShipment(),
      productsById,
      fromAddress: "Грозный, ул. Мира, 1",
      shipmentPointCode: "GRZ3",
    });

    assert.equal(body.type, 1);
    assert.equal(body.tariff_code, 136);
    assert.equal(body.shipment_point, "GRZ3");
    assert.equal(body.from_location, undefined);
    assert.equal(body.delivery_point, "KZN12");
    assert.deepEqual(body.delivery_recipient_cost, { value: 435 });
    assert.deepEqual(body.recipient, {
      name: "Иван Петров",
      phones: [{ number: "+79990001122" }],
    });
    assert.equal(body.number, "650000000000000000000abc-000001");
  });

  it("дверь-склад: забор по адресу продавца вместо пункта приёма", () => {
    const body = buildCdekOrderBody({
      order: makeOrder(),
      shipment: makeShipment({
        cdekShipmentAtOrder: { ...makeShipment().cdekShipmentAtOrder, deliveryMode: 2 },
      }),
      productsById,
      fromAddress: "Грозный, ул. Мира, 1",
      shipmentPointCode: "GRZ3",
    });

    assert.deepEqual(body.from_location, { address: "Грозный, ул. Мира, 1" });
    assert.equal(body.shipment_point, undefined);
  });

  it("в посылку идут только позиции этого продавца, вес и высота на количество", () => {
    const body = buildCdekOrderBody({
      order: makeOrder(),
      shipment: makeShipment(),
      productsById,
      fromAddress: "",
      shipmentPointCode: "GRZ3",
    });

    const [pack] = body.packages;
    assert.equal(pack.items.length, 1);
    assert.equal(pack.items[0].ware_key, productId);
    assert.equal(pack.items[0].amount, 2);
    assert.equal(pack.weight, 700);
    assert.equal(pack.length, 20);
    assert.equal(pack.width, 15);
    assert.equal(pack.height, 16);
  });

  it("оплата при получении: СДЭК берёт с покупателя цену товара", () => {
    const body = buildCdekOrderBody({
      order: makeOrder(),
      shipment: makeShipment(),
      productsById,
      fromAddress: "",
      shipmentPointCode: "GRZ3",
    });
    assert.deepEqual(body.packages[0].items[0].payment, { value: 90000 });
    assert.equal(body.packages[0].items[0].cost, 90000);
  });

  it("предоплата: за товар в пункте не берём ничего, страховка остаётся", () => {
    const body = buildCdekOrderBody({
      order: makeOrder({ paymentMethod: "cardPrepaid" }),
      shipment: makeShipment(),
      productsById,
      fromAddress: "",
      shipmentPointCode: "GRZ3",
    });
    assert.deepEqual(body.packages[0].items[0].payment, { value: 0 });
    assert.equal(body.packages[0].items[0].cost, 90000);
  });
});

describe("createCdekWaybill — проверки до обращения в СДЭК", () => {
  afterEach(() => mock.restoreAll());

  /**
   * @param {Record<string, unknown> | null} order
   */
  function mockOrder(order) {
    mock.method(OrderModel, "findById", () => ({ lean: async () => order }));
  }

  it("чужой заказ — 404", async () => {
    mockOrder(makeOrder({ shipments: [makeShipment({ sellerId: otherSellerId })] }));
    await assert.rejects(
      createCdekWaybill({ orderId: "650000000000000000000abc", sellerId }),
      (error) => error.statusCode === 404 || error.status === 404,
    );
  });

  it("накладная уже есть — 409", async () => {
    mockOrder(
      makeOrder({ shipments: [makeShipment({ cdekWaybill: { uuid: "u-1" } })] }),
    );
    await assert.rejects(
      createCdekWaybill({
        orderId: "650000000000000000000abc",
        sellerId,
        shipmentPointCode: "X",
      }),
      /уже создана/,
    );
  });

  it("предоплата картой ещё не пришла — накладную не создаём", async () => {
    mockOrder(makeOrder({ paymentMethod: "cardPrepaid", shipments: [makeShipment()] }));
    await assert.rejects(
      createCdekWaybill({
        orderId: "650000000000000000000abc",
        sellerId,
        shipmentPointCode: "GRZ3",
      }),
      /ещё не оплачен/,
    );
  });

  it("склад-склад без пункта приёма — просим выбрать пункт", async () => {
    mockOrder(makeOrder({ shipments: [makeShipment()] }));
    await assert.rejects(
      createCdekWaybill({ orderId: "650000000000000000000abc", sellerId }),
      /куда отвезёте посылку/,
    );
  });
});

describe("статусы СДЭК → ступени заказа", () => {
  it("созданная накладная заказ не двигает, приём — «Отгружен», вручение — «Доставлен»", async () => {
    const { resolveOrderStepForCdekStatus } =
      await import("../services/shipping/cdek/cdekWaybill.js");
    assert.equal(resolveOrderStepForCdekStatus("CREATED"), null);
    assert.equal(resolveOrderStepForCdekStatus("ACCEPTED"), null);
    assert.equal(resolveOrderStepForCdekStatus("INVALID"), null);
    assert.equal(
      resolveOrderStepForCdekStatus("RECEIVED_AT_SHIPMENT_WAREHOUSE"),
      "shipped",
    );
    assert.equal(resolveOrderStepForCdekStatus("ACCEPTED_AT_PICK_UP_POINT"), "shipped");
    assert.equal(resolveOrderStepForCdekStatus("DELIVERED"), "delivered");
    assert.equal(resolveOrderStepForCdekStatus("NOT_DELIVERED"), null);
    assert.equal(resolveOrderStepForCdekStatus(""), null);
  });

  it("берёт самый свежий статус, а не первый в массиве", async () => {
    const { readCdekOrderState } =
      await import("../services/shipping/cdek/cdekWaybill.js");
    const state = readCdekOrderState({
      entity: {
        cdek_number: "10323896114",
        statuses: [
          { code: "CREATED", name: "Создан", date_time: "2026-09-21T10:00:00+0000" },
          {
            code: "RECEIVED_AT_SHIPMENT_WAREHOUSE",
            name: "Принят на склад отправителя",
            date_time: "2026-09-22T09:00:00+0000",
          },
          { code: "ACCEPTED", name: "Принят", date_time: "2026-09-21T09:59:00+0000" },
        ],
      },
    });
    assert.equal(state.statusCode, "RECEIVED_AT_SHIPMENT_WAREHOUSE");
    assert.equal(state.status, "Принят на склад отправителя");
    assert.equal(state.cdekNumber, "10323896114");
  });
});
