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
  buildExpressClaimBody,
  readExpressClaimInfo,
  resolveOrderStepForExpressStatus,
  createYandexExpressClaim,
  refreshYandexExpressClaim,
  quoteYandexExpress,
  setSellerYandexExpress,
} = await import("../services/shipping/yandex/yandexExpress.js");
const { markOrderItemShippedBySeller } =
  await import("../services/order/updateOrderItemStatus.js");
const { markOrderItemCancelled } =
  await import("../services/order/cancelOrderItems.js");
const { createOrder } = await import("../services/order/createOrder.js");

const realFetch = globalThis.fetch;

const SNAPSHOT = {
  deliverySumRub: 640,
  pickup: {
    address: "Грозный, ул. Мира, 1",
    lat: 43.31,
    lon: 45.69,
    phone: "+79990001111",
  },
  dropoff: { address: "Грозный, пр. Путина, 5", flat: "12", lat: 43.32, lon: 45.7 },
  recipient: { name: "Иван Петров", phone: "+79990001122" },
};

/**
 * Подмена Яндекса «Экспресс»: ответ по пути (функция — для ответов по очереди).
 *
 * @param {Record<string, unknown | (() => unknown)>} answers
 */
function mockExpress(answers) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = new URL(String(url));
    const path = href.pathname.replace(/^.*\/integration\/v2/, "");
    calls.push({ path, body: init.body ? JSON.parse(String(init.body)) : null });
    const answer = answers[path];
    if (answer === undefined) return new Response("{}", { status: 404 });
    const value = typeof answer === "function" ? answer() : answer;
    return new Response(JSON.stringify(value), { status: 200 });
  };
  return calls;
}

describe("«Экспресс»: тело заявки и статусы", () => {
  it("тело: забор у продавца по коду, оплата курьеру картой, доставка отдельной строкой", () => {
    const body = buildExpressClaimBody({
      order: {
        _id: "650000000000000000000abc",
        items: [
          {
            productId: "64c000000000000000000001",
            sellerIdAtOrder: "64b000000000000000000001",
            productNameAtOrder: "шоколад",
            unitPriceAtOrder: 750,
            quantity: 2,
            status: "ready_to_ship",
          },
        ],
      },
      shipment: {
        sellerId: "64b000000000000000000001",
        yandexExpressShipmentAtOrder: SNAPSHOT,
      },
      productsById: new Map(),
      sellerName: "Магазин",
    });

    const [goods, delivery] = body.items;
    assert.equal(goods.cost_value, "750.00");
    assert.equal(goods.quantity, 2);
    assert.equal(delivery.title, "Доставка");
    assert.equal(delivery.cost_value, "640.00");
    assert.equal(delivery.fiscalization.item_type, "service");

    const [source, destination] = body.route_points;
    assert.equal(source.type, "source");
    assert.equal(source.skip_confirmation, false);
    assert.deepEqual(source.address.coordinates, [45.69, 43.31]);
    assert.equal(source.contact.phone, "+79990001111");
    assert.equal(destination.type, "destination");
    assert.deepEqual(destination.address.coordinates, [45.7, 43.32]);
    assert.equal(destination.address.sflat, "12");
    assert.deepEqual(destination.payment_on_delivery, {
      payment_method: "card",
      customer: { phone: "+79990001122" },
    });
    assert.deepEqual(body.client_requirements, { taxi_class: "express" });
  });

  it("статусы «Экспресса» → ступени заказа", () => {
    assert.equal(resolveOrderStepForExpressStatus("performer_found"), null);
    assert.equal(resolveOrderStepForExpressStatus("pickuped"), "shipped");
    assert.equal(resolveOrderStepForExpressStatus("pay_waiting"), "shipped");
    assert.equal(resolveOrderStepForExpressStatus("delivered_finish"), "delivered");
    assert.equal(resolveOrderStepForExpressStatus("returning"), null);
  });

  it("цена — итоговая, а пока её нет — из оценки", () => {
    assert.equal(
      readExpressClaimInfo({
        pricing: { offer: { price: "640.50" }, final_price: null },
      }).priceRub,
      640.5,
    );
    assert.equal(
      readExpressClaimInfo({ pricing: { offer: { price: "640" }, final_price: "700" } })
        .priceRub,
      700,
    );
  });
});

describe("«Экспресс» на живом заказе", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  async function setupSeller({ expressEnabled = true } = {}) {
    const fixture = await createOrderLoyaltyFixture();
    await UserModel.updateOne(
      { _id: fixture.seller._id },
      {
        $set: {
          yandexDeliveryIntegration: {
            enabled: true,
            tokenSealed: sealYandexDeliveryToken("token-1234"),
            environment: "prod",
            express: { enabled: expressEnabled, phone: "+79990001111" },
          },
          "sellerFulfillmentDefaults.pickupLocations": [
            {
              id: "loc-1",
              address: "Грозный, ул. Мира, 1",
              lat: 43.31,
              lon: 45.69,
              isDefault: true,
            },
          ],
        },
      },
    );
    return fixture;
  }

  async function createExpressOrder() {
    const { seller, buyer, product } = await setupSeller();
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
              deliveryCarrier: "yandex_express",
              yandexExpressShipmentAtOrder: SNAPSHOT,
            },
          ],
        },
      },
    );
    return { orderId: String(order._id), sellerId: String(seller._id) };
  }

  it("расчёт для корзины: выключен у продавца — варианта нет", async () => {
    const { product } = await setupSeller({ expressEnabled: false });
    const result = await quoteYandexExpress({
      items: [{ productId: String(product._id), quantity: 1 }],
      toLat: 43.32,
      toLon: 45.7,
    });
    assert.deepEqual(result, { available: false, reason: "not_ready" });
  });

  it("расчёт для корзины: цена вверх до рубля и время в пути", async () => {
    const { product } = await setupSeller();
    const calls = mockExpress({ "/check-price": { price: "712.48", eta: 19.05 } });

    const result = await quoteYandexExpress({
      items: [{ productId: String(product._id), quantity: 1 }],
      toLat: 43.32,
      toLon: 45.7,
    });

    assert.equal(result.available, true);
    assert.equal(result.deliverySumRub, 713);
    assert.equal(result.etaMinutes, 19);
    assert.deepEqual(calls[0].body.route_points, [
      { coordinates: [45.69, 43.31] },
      { coordinates: [45.7, 43.32] },
    ]);
  });

  it("включить «Экспресс» без точки продажи на карте нельзя", async () => {
    const { seller } = await createOrderLoyaltyFixture();
    await UserModel.updateOne(
      { _id: seller._id },
      {
        $set: {
          "yandexDeliveryIntegration.tokenSealed": sealYandexDeliveryToken("t-1234"),
        },
      },
    );
    await assert.rejects(
      setSellerYandexExpress({
        sellerId: String(seller._id),
        enabled: true,
        phone: "+79990001111",
      }),
      /точку продажи/,
    );
  });

  it("вызов курьера: создать → дождаться оценки → подтвердить → ссылка", async () => {
    const ids = await createExpressOrder();
    const infos = [
      { status: "estimating", version: 1 },
      {
        status: "ready_for_approval",
        version: 2,
        pricing: { offer: { price: "655" } },
      },
      { status: "accepted", version: 3, pricing: { offer: { price: "655" } } },
    ];
    const calls = mockExpress({
      "/claims/create": { id: "claim-1", status: "new" },
      "/claims/info": () => infos.shift() ?? { status: "accepted", version: 3 },
      "/claims/accept": { status: "accepted" },
      "/claims/tracking-links": {
        route_points: [
          { type: "destination", sharing_link: "https://go.yandex/route/1" },
        ],
      },
    });

    const claim = await createYandexExpressClaim({ ...ids, sleepFn: async () => {} });

    assert.equal(claim.claimId, "claim-1");
    assert.equal(claim.status, "accepted");
    assert.equal(claim.priceRub, 655);
    const accept = calls.find((call) => call.path === "/claims/accept");
    assert.deepEqual(accept.body, { version: 2 });
    const order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.shippingTrackingUrl, "https://go.yandex/route/1");
    assert.equal(order.items[0].status, "pending");

    await assert.rejects(
      createYandexExpressClaim({ ...ids, sleepFn: async () => {} }),
      /уже вызван/,
    );
  });

  it("ступени ставит курьер, а не кнопка продавца; код передачи виден", async () => {
    const ids = await createExpressOrder();
    await OrderModel.updateOne(
      { _id: ids.orderId },
      {
        $set: {
          "shipments.0.yandexExpressClaim": {
            claimId: "claim-1",
            status: "accepted",
            acceptedAt: new Date(),
            sharingUrl: "https://go.yandex/route/1",
          },
        },
      },
    );

    await assert.rejects(
      markOrderItemShippedBySeller({ ...ids, itemIndex: 0 }),
      /когда Яндекс примет посылку/,
    );

    mockExpress({
      "/claims/info": { status: "ready_for_pickup_confirmation", version: 4 },
      "/claims/confirmation_code": { code: "2000", attempts: 1 },
    });
    const waiting = await refreshYandexExpressClaim(ids);
    assert.equal(waiting.pickupCode, "2000");

    mockExpress({ "/claims/info": { status: "pickuped", version: 5 } });
    await refreshYandexExpressClaim(ids);
    let order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.items[0].status, "shipped");

    mockExpress({ "/claims/info": { status: "delivered_finish", version: 6 } });
    await refreshYandexExpressClaim(ids);
    order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.items[0].status, "delivered");
  });

  it("отмена заказа отменяет курьера с условием, которое назвал Яндекс", async () => {
    const ids = await createExpressOrder();
    await OrderModel.updateOne(
      { _id: ids.orderId },
      {
        $set: {
          "shipments.0.shippingExternalId": "claim-1",
          "shipments.0.yandexExpressClaim": {
            claimId: "claim-1",
            status: "performer_found",
          },
        },
      },
    );
    const calls = mockExpress({
      "/claims/cancel-info": { cancel_state: "paid", price: "150" },
      "/claims/info": { status: "performer_found", version: 7 },
      "/claims/cancel": { status: "cancelled_with_payment" },
    });

    await markOrderItemCancelled({
      orderId: ids.orderId,
      itemIndex: 0,
      requestUserId: ids.sellerId,
      userId: ids.sellerId,
    });

    const cancel = calls.find((call) => call.path === "/claims/cancel");
    assert.deepEqual(cancel.body, { cancel_state: "paid", version: 7 });
    const order = await OrderModel.findById(ids.orderId).lean();
    assert.equal(order.shipments[0].yandexExpressClaim.cancelState, "paid");
  });

  it("наличными с «Экспрессом» не оформить — только картой курьеру", async () => {
    const { buyer, product } = await setupSeller();
    await UserModel.updateOne({ _id: buyer._id }, { $set: { isEmailVerified: true } });
    await assert.rejects(
      createOrder({
        userId: String(buyer._id),
        items: [{ productId: String(product._id), quantity: 1 }],
        paymentMethod: "cashOnDelivery",
        fulfillmentMethod: "delivery",
        yandexExpressShipment: {
          recipient: { name: "Иван Петров", phone: "+79990001122" },
        },
      }),
      /только картой/,
    );
  });
});
