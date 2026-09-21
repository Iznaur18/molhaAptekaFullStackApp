import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserModel } = await import("../models/index.js");
const { sealYandexDeliveryToken } =
  await import("../services/shipping/yandex/yandexDeliveryCredentialsCrypto.js");
const {
  buildYandexOfferBody,
  pickCheapestOffer,
  resolveOrderStepForYandexStatus,
  createYandexDeliveryRequest,
  refreshYandexDeliveryRequest,
} = await import("../services/shipping/yandex/yandexDeliveryRequest.js");
const { markOrderItemShippedBySeller } =
  await import("../services/order/updateOrderItemStatus.js");
const { markOrderItemCancelled } =
  await import("../services/order/cancelOrderItems.js");

const realFetch = globalThis.fetch;

const SNAPSHOT = {
  deliverySumRub: 200,
  dropoffStationId: "drop-1",
  pickupPoint: { id: "pvz-1", address: "Грозный, пр. Путина, 1" },
  recipient: { name: "Иван Петров", phone: "+79990001122" },
};

/**
 * Подмена Яндекса: ответы по пути, журнал запросов.
 *
 * @param {Record<string, unknown>} answers
 */
function mockYandex(answers) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = new URL(String(url));
    const path = href.pathname.replace(/^.*\/platform/, "");
    calls.push({ path, body: init.body ? JSON.parse(String(init.body)) : null });
    const answer = answers[path];
    if (answer === undefined) return new Response("{}", { status: 404 });
    return new Response(JSON.stringify(answer), { status: 200 });
  };
  return calls;
}

describe("заявка Яндекс Доставки: тело и статусы", () => {
  it("тело заявки: пункт сдачи → пункт выдачи, оплата картой, доставка с покупателя", () => {
    const body = buildYandexOfferBody({
      order: {
        _id: "650000000000000000000abc",
        items: [
          {
            productId: "64c000000000000000000001",
            sellerIdAtOrder: "64b000000000000000000001",
            productNameAtOrder: "айфон 16",
            unitPriceAtOrder: 90000,
            quantity: 2,
            status: "accepted",
          },
        ],
      },
      shipment: {
        sellerId: "64b000000000000000000001",
        yandexDeliveryShipmentAtOrder: SNAPSHOT,
      },
      productsById: new Map([
        [
          "64c000000000000000000001",
          {
            productWeightG: 350,
            productLengthCm: 20,
            productWidthCm: 15,
            productHeightCm: 8,
          },
        ],
      ]),
      sellerInn: "2014000000",
    });

    assert.deepEqual(body.source, { platform_station: { platform_id: "drop-1" } });
    assert.deepEqual(body.destination, {
      type: "platform_station",
      platform_station: { platform_id: "pvz-1" },
    });
    assert.equal(body.last_mile_policy, "self_pickup");
    assert.deepEqual(body.billing_info, {
      payment_method: "card_on_receipt",
      delivery_cost: 20000,
    });
    assert.equal(body.items[0].count, 2);
    assert.equal(body.items[0].billing_details.unit_price, 9_000_000);
    assert.equal(body.items[0].billing_details.inn, "2014000000");
    assert.equal(body.places[0].physical_dims.weight_gross, 700);
    assert.equal(body.places[0].barcode, body.items[0].place_barcode);
    assert.deepEqual(body.recipient_info, {
      first_name: "Иван",
      last_name: "Петров",
      phone: "+79990001122",
    });
  });

  it("из нескольких предложений берёт самое дешёвое", () => {
    const offer = pickCheapestOffer({
      offers: [
        { offer_id: "a", offer_details: { pricing_total: "300 RUB" } },
        { offer_id: "b", offer_details: { pricing_total: "236.55 RUB" } },
      ],
    });
    assert.equal(offer.offer_id, "b");
    assert.equal(pickCheapestOffer({ offers: [] }), null);
  });

  it("статусы Яндекса → ступени заказа", () => {
    assert.equal(resolveOrderStepForYandexStatus("CREATED"), null);
    assert.equal(resolveOrderStepForYandexStatus("SORTING_CENTER_LOADED"), null);
    assert.equal(resolveOrderStepForYandexStatus("SORTING_CENTER_AT_START"), "shipped");
    assert.equal(
      resolveOrderStepForYandexStatus("DELIVERY_ARRIVED_PICKUP_POINT"),
      "shipped",
    );
    assert.equal(resolveOrderStepForYandexStatus("DELIVERY_DELIVERED"), "delivered");
    assert.equal(resolveOrderStepForYandexStatus("CANCELLED"), null);
    assert.equal(resolveOrderStepForYandexStatus("PARTICULARLY_DELIVERED"), null);
  });
});

describe("заявка Яндекс Доставки на живом заказе", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  async function createYandexOrder() {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    await UserModel.updateOne(
      { _id: seller._id },
      {
        $set: {
          yandexDeliveryIntegration: {
            enabled: true,
            tokenSealed: sealYandexDeliveryToken("token-1234"),
            environment: "prod",
            dropoffStation: { id: "drop-1", name: "ПВЗ", address: "Грозный" },
          },
        },
      },
    );
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          fulfillmentMethod: "delivery",
          shipments: [
            {
              sellerId: seller._id,
              fulfillmentMethod: "delivery",
              deliveryCarrier: "yandex_delivery",
              yandexDeliveryShipmentAtOrder: SNAPSHOT,
            },
          ],
        },
      },
    );
    return { orderId: String(order._id), sellerId: String(seller._id) };
  }

  it("создание: предложение → подтверждение → статус; ссылка отслеживания в заказе", async () => {
    const ids = await createYandexOrder();
    const calls = mockYandex({
      "/offers/create": {
        offers: [{ offer_id: "of-1", offer_details: { pricing_total: "236.55 RUB" } }],
      },
      "/offers/confirm": { request_id: "req-1" },
      "/request/info": {
        state: { status: "CREATED", description: "Принят" },
        sharing_url: "https://dostavka.yandex.ru/route/abc",
      },
    });

    const request = await createYandexDeliveryRequest(ids);

    assert.equal(request.requestId, "req-1");
    assert.equal(request.status, "CREATED");
    assert.deepEqual(
      calls.map((call) => call.path),
      ["/offers/create", "/offers/confirm", "/request/info"],
    );
    const order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.shippingTrackingUrl, "https://dostavka.yandex.ru/route/abc");
    assert.equal(order.items[0].status, "pending");

    await assert.rejects(createYandexDeliveryRequest(ids), /уже создана/);
  });

  it("ступени ставит Яндекс, а не кнопка продавца", async () => {
    const ids = await createYandexOrder();
    await OrderModel.updateOne(
      { _id: ids.orderId },
      {
        $set: {
          "shipments.0.yandexDeliveryRequest": {
            requestId: "req-1",
            status: "CREATED",
          },
        },
      },
    );

    await assert.rejects(
      markOrderItemShippedBySeller({ ...ids, itemIndex: 0 }),
      /когда Яндекс примет посылку/,
    );

    mockYandex({ "/request/info": { state: { status: "SORTING_CENTER_AT_START" } } });
    await refreshYandexDeliveryRequest(ids);
    let order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.items[0].status, "shipped");

    mockYandex({ "/request/info": { state: { status: "DELIVERY_DELIVERED" } } });
    await refreshYandexDeliveryRequest(ids);
    order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.items[0].status, "delivered");
  });

  it("отмена заказа отменяет заявку в Яндексе, а не в ЛОБО", async () => {
    const ids = await createYandexOrder();
    await OrderModel.updateOne(
      { _id: ids.orderId },
      {
        $set: {
          "shipments.0.shippingExternalId": "req-1",
          "shipments.0.yandexDeliveryRequest": {
            requestId: "req-1",
            status: "CREATED",
          },
        },
      },
    );
    const calls = mockYandex({
      "/request/cancel": { status: "CREATED", reason: "cancellation_started" },
    });

    await markOrderItemCancelled({
      orderId: ids.orderId,
      itemIndex: 0,
      requestUserId: ids.sellerId,
      userId: ids.sellerId,
    });

    assert.deepEqual(
      calls.map((call) => call.path),
      ["/request/cancel"],
    );
    const order = await OrderModel.findById(ids.orderId).lean();
    assert.ok(order.shipments[0].yandexDeliveryRequest.cancelledAt);
  });
});
