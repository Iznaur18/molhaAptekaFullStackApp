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
const { sealCdekSecret } =
  await import("../services/shipping/cdek/cdekCredentialsCrypto.js");
const { forgetCdekToken } = await import("../services/shipping/cdek/cdekClient.js");
const { refreshCdekWaybill } = await import("../services/shipping/cdek/cdekWaybill.js");
const { markOrderItemCancelled } =
  await import("../services/order/cancelOrderItems.js");

const realFetch = globalThis.fetch;

/**
 * Подменяет СДЭК: токен всегда выдаётся, остальное — по таблице `routes`
 * вида «МЕТОД путь» → ответ. Все вызовы пишутся в журнал.
 *
 * @param {Record<string, { status?: number; body: unknown }>} routes
 */
function mockCdek(routes) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const href = new URL(String(url));
    if (href.pathname.endsWith("/oauth/token")) {
      return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }), {
        status: 200,
      });
    }
    const key = `${init.method ?? "GET"} ${href.pathname.replace(/^\/v2/, "")}`;
    calls.push(key);
    const route = routes[key];
    if (!route) {
      return new Response(JSON.stringify({ requests: [] }), { status: 404 });
    }
    return new Response(JSON.stringify(route.body), { status: route.status ?? 200 });
  };
  return calls;
}

/**
 * Заказ продавца со СДЭК и уже созданной накладной `u-1`.
 *
 * @param {{ itemStatus: string }} options
 */
async function createCdekOrder({ itemStatus }) {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  await UserModel.updateOne(
    { _id: seller._id },
    {
      $set: {
        cdekIntegration: {
          enabled: true,
          account: "acc",
          secureSealed: sealCdekSecret("sec"),
          environment: "prod",
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
        "items.0.status": itemStatus,
        shipments: [
          {
            sellerId: seller._id,
            fulfillmentMethod: "delivery",
            deliveryCarrier: "cdek",
            shippingExternalId: "u-1",
            cdekShipmentAtOrder: { tariffCode: 136, deliveryMode: 4 },
            cdekWaybill: { uuid: "u-1", cdekNumber: "100", statusCode: "CREATED" },
          },
        ],
      },
    },
  );
  return { seller, buyer, orderId: String(order._id) };
}

const readShipment = async (orderId) => {
  const order = await OrderModel.findById(orderId).lean();
  return { order, shipment: order.shipments[0] };
};

describe("СДЭК: отмена заказа и возврат посылки", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);
  afterEach(() => {
    globalThis.fetch = realFetch;
    forgetCdekToken({ account: "acc", secure: "sec", environment: "prod" });
  });

  it("отмена заказа удаляет накладную в СДЭК", async () => {
    const calls = mockCdek({
      "DELETE /orders/u-1": { body: { entity: { uuid: "u-1" } } },
    });
    const { seller, orderId } = await createCdekOrder({ itemStatus: "ready_to_ship" });

    await markOrderItemCancelled({
      orderId,
      itemIndex: 0,
      requestUserId: String(seller._id),
      userId: seller._id,
    });

    const { order, shipment } = await readShipment(orderId);
    assert.equal(order.items[0].status, "cancelled");
    assert.deepEqual(calls, ["DELETE /orders/u-1"]);
    assert.ok(shipment.cdekWaybill.cancelledAt, "накладная помечена отменённой");
    assert.equal(shipment.cdekWaybill.cancelError, null);
  });

  it("СДЭК не дал удалить — заказ всё равно отменён, продавцу оставлена причина", async () => {
    mockCdek({
      "DELETE /orders/u-1": {
        status: 400,
        body: { requests: [{ errors: [{ message: "Заказ уже в пути" }] }] },
      },
    });
    const { seller, orderId } = await createCdekOrder({ itemStatus: "ready_to_ship" });

    await markOrderItemCancelled({
      orderId,
      itemIndex: 0,
      requestUserId: String(seller._id),
      userId: seller._id,
    });

    const { order, shipment } = await readShipment(orderId);
    assert.equal(order.items[0].status, "cancelled");
    assert.equal(shipment.cdekWaybill.cancelledAt ?? null, null);
    assert.equal(shipment.cdekWaybill.cancelError, "Заказ уже в пути");
  });

  it("возвратный заказ вручён продавцу — позиция «Вернулся»", async () => {
    mockCdek({
      "GET /orders/u-1": {
        body: {
          entity: {
            cdek_number: "100",
            statuses: [
              {
                code: "NOT_DELIVERED",
                name: "Не вручен",
                date_time: "2026-09-25T10:00:00+0000",
              },
            ],
            related_entities: [{ type: "return_order", uuid: "r-1" }],
          },
        },
      },
      "GET /orders/r-1": {
        body: {
          entity: {
            statuses: [
              {
                code: "DELIVERED",
                name: "Вручен",
                date_time: "2026-09-28T10:00:00+0000",
              },
            ],
          },
        },
      },
    });
    const { seller, orderId } = await createCdekOrder({ itemStatus: "shipped" });

    const waybill = await refreshCdekWaybill({ orderId, sellerId: String(seller._id) });

    assert.equal(waybill.returnUuid, "r-1");
    assert.equal(waybill.returnStatusCode, "DELIVERED");
    const { order } = await readShipment(orderId);
    assert.equal(order.items[0].status, "returned");
  });

  it("посылка ещё едет обратно — заказ не трогаем", async () => {
    mockCdek({
      "GET /orders/u-1": {
        body: {
          entity: {
            cdek_number: "100",
            statuses: [
              {
                code: "NOT_DELIVERED",
                name: "Не вручен",
                date_time: "2026-09-25T10:00:00+0000",
              },
            ],
            related_entities: [{ type: "return_order", uuid: "r-1" }],
          },
        },
      },
      "GET /orders/r-1": {
        body: {
          entity: {
            statuses: [
              {
                code: "SENT_TO_TRANSIT_CITY",
                name: "Отправлен в г. транзит",
                date_time: "2026-09-26T10:00:00+0000",
              },
            ],
          },
        },
      },
    });
    const { seller, orderId } = await createCdekOrder({ itemStatus: "shipped" });

    const waybill = await refreshCdekWaybill({ orderId, sellerId: String(seller._id) });

    assert.equal(waybill.returnStatus, "Отправлен в г. транзит");
    const { order } = await readShipment(orderId);
    assert.equal(order.items[0].status, "shipped");
  });
});
