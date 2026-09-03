import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
// Мок DMS: боевые ключи для этого не нужны и не должны быть.
process.env.LOBO_API_KEY = "dms_mock_key";
process.env.LOBO_API_LOGIN = "mock";
process.env.LOBO_API_PASSWORD = "mock";
process.env.LOBO_API_BASE_URL = "http://127.0.0.1:3092/api/v1/external";

const { startLoboMock } = await import("./helpers/loboMockProcess.js");
let loboMock;

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserModel } = await import("../models/index.js");
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const sync = await import("../services/shipping/lobo/loboStatusSync.js");

/** Отправление, уже отданное в ЛОБО. */
async function handedOverShipment() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await UserModel.updateOne(
    { _id: seller._id },
    { $set: { userPhoneNumber: "+79280000001" } },
  );
  await OrderModel.updateOne(
    { _id: order._id },
    {
      $set: {
        fulfillmentMethod: "delivery",
        deliveryAddress: "г Грозный, пр. Путина, 5",
        deliveryAddressGeo: { lat: 43.35, lon: 45.72 },
        "items.0.pickupAddressAtOrder": "г Грозный, ул Складская, 1",
        "items.0.pickupLatAtOrder": 43.31,
        "items.0.pickupLonAtOrder": 45.69,
        shipments: [
          {
            sellerId: seller._id,
            fulfillmentMethod: "delivery",
            deliveryCarrier: "lobo",
            deliveryFeeRub: 0,
          },
        ],
      },
    },
  );

  const args = {
    orderId: String(order._id),
    sellerId: String(seller._id),
  };
  for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
    await advanceOrderShipmentStatus({ ...args, nextStatus });
  }
  return { order, seller, buyer, args };
}

/** @param {string} orderId @param {string} carrierStatus */
const setCarrierStatus = (orderId, carrierStatus) =>
  OrderModel.updateOne(
    { _id: orderId },
    { $set: { "shipments.0.shippingCarrierStatus": carrierStatus } },
  );

describe("раскладка статусов ЛОБО на нашу лестницу", () => {
  before(async () => {
    loboMock = await startLoboMock({ port: 3092 });
    await connectMongoTestReplSet();
  });
  after(async () => {
    await disconnectMongoTestReplSet();
    await loboMock?.stop();
  });
  beforeEach(clearMongoCollections);

  it("«забрал» переводит заказ в «На доставке»", async () => {
    const { order } = await handedOverShipment();
    // Мок двигает статус по времени; здесь важна именно раскладка.
    assert.equal(sync.resolveLadderStatusForCarrier("picked_up"), "in_delivery");

    await setCarrierStatus(order._id, "arrived");
    const before = await OrderModel.findById(order._id).lean();
    assert.equal(before.status, "ready_to_ship", "до забора товар у продавца");
  });

  it("промежуточные статусы лестницу не двигают", () => {
    for (const carrierStatus of ["created", "assigned", "accepted", "arrived"]) {
      assert.equal(
        sync.resolveLadderStatusForCarrier(carrierStatus),
        null,
        "товар всё ещё у продавца — сообщать покупателю нечего",
      );
    }
  });

  it("«доставлен» ведёт к нашему «Доставлен», а не к закрытию сделки", () => {
    assert.equal(sync.resolveLadderStatusForCarrier("delivered"), "delivered");
  });

  it("в очередь опроса попадают только незавершённые отправления", async () => {
    const { order } = await handedOverShipment();

    const pending = await sync.findLoboShipmentsToSync();
    assert.equal(pending.length, 1);
    assert.equal(pending[0].orderId, String(order._id));

    await setCarrierStatus(order._id, "delivered");
    assert.deepEqual(
      await sync.findLoboShipmentsToSync(),
      [],
      "доставленное спрашивать больше незачем",
    );
  });

  it("опрос догоняет статус службы и двигает лестницу", async () => {
    const { order } = await handedOverShipment();

    // Мок сам двигает статус по таймеру, и шаг зависит от окружения:
    // ждём не по часам, а пока служба действительно отдаст товар курьеру.
    let moved = false;
    for (let attempt = 0; attempt < 20 && !moved; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await sync.syncLoboShipmentStatuses();
      const current = await OrderModel.findById(order._id).lean();
      moved = ["in_delivery", "delivered", "confirmed"].includes(current.status);
    }

    const fresh = await OrderModel.findById(order._id).lean();
    assert.ok(moved, `лестница не сдвинулась, статус заказа ${fresh.status}`);
    assert.ok(fresh.shipments[0].shippingSyncedAt, "отметка опроса проставлена");
  });

  it("пропущенный «забрал» не подвешивает отправление", async () => {
    const { order, seller } = await handedOverShipment();
    // Курьер забрал и довёз между двумя опросами: у нас всё ещё «Готов к
    // отгрузке», а служба уже говорит «доставлен».
    const { syncLoboShipmentStatuses } = sync;
    const before = await OrderModel.findById(order._id).lean();
    assert.equal(before.status, "ready_to_ship");

    await sync.__applyForTest({
      orderId: String(order._id),
      sellerId: String(seller._id),
      ladderStatus: "delivered",
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "delivered", "иначе отправление зависает навсегда");
    assert.ok(syncLoboShipmentStatuses);
  });

  it("непереданное отправление догоняется повтором", async () => {
    const { order, args } = await handedOverShipment();
    // Имитируем неудачную передачу: номера у службы нет.
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { "shipments.0.shippingExternalId": "" } },
    );

    const result = await sync.retryPendingLoboHandovers();

    assert.equal(result.retried, 1);
    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(
      fresh.shipments[0].shippingExternalId,
      `${args.orderId}:${args.sellerId}`,
    );
  });
});
