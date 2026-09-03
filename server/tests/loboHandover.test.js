import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
// Мок DMS: боевые ключи для этого не нужны и не должны быть.
process.env.LOBO_API_KEY = "dms_mock_key";
process.env.LOBO_API_LOGIN = "mock";
process.env.LOBO_API_PASSWORD = "mock";
process.env.LOBO_API_BASE_URL = "http://127.0.0.1:3093/api/v1/external";

const { startLoboMock } = await import("./helpers/loboMockProcess.js");
let loboMock;

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel } = await import("../models/index.js");
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const { handOverShipmentToLobo, cancelShipmentInLobo } = await import(
  "../services/shipping/lobo/loboShipmentOrders.js"
);

/** Заказ, который везёт ЛОБО, доведённый до нужной ступени. */
async function loboOrder({ withGeo = true } = {}) {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });

  // Служба требует телефон продавца — без него заказ она не примет.
  const { UserModel } = await import("../models/index.js");
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
        ...(withGeo ? { deliveryAddressGeo: { lat: 43.35, lon: 45.72 } } : {}),
        "items.0.pickupAddressAtOrder": "г Грозный, ул Складская, 1",
        "items.0.pickupLatAtOrder": 43.31,
        "items.0.pickupLonAtOrder": 45.69,
        shipments: [
          {
            sellerId: seller._id,
            fulfillmentMethod: "delivery",
            courierDelivery: false,
            deliveryCarrier: "lobo",
            deliveryFeeRub: 0,
          },
        ],
      },
    },
  );

  return { order, seller, buyer, args: { orderId: String(order._id), sellerId: String(seller._id) } };
}

describe("передача отправления в ЛОБО", () => {
  before(async () => {
    loboMock = await startLoboMock({ port: 3093 });
    await connectMongoTestReplSet();
  });
  after(async () => {
    await disconnectMongoTestReplSet();
    await loboMock?.stop();
  });
  beforeEach(clearMongoCollections);

  it("на «Готов к отгрузке» заказ уходит в службу", async () => {
    const { args, order } = await loboOrder();

    for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
      await advanceOrderShipmentStatus({ ...args, nextStatus });
    }

    const fresh = await OrderModel.findById(order._id).lean();
    const shipment = fresh.shipments[0];
    assert.equal(shipment.shippingProvider, "lobo");
    assert.equal(shipment.shippingExternalId, `${order._id}:${args.sellerId}`);
    assert.equal(shipment.shippingCarrierStatus, "created");
    assert.ok(
      shipment.deliveryFeeRub > 0,
      "цену спрашиваем у службы: её назовёт курьер покупателю",
    );
  });

  it("повторная передача не создаёт второй заказ", async () => {
    const { args } = await loboOrder();
    for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
      await advanceOrderShipmentStatus({ ...args, nextStatus });
    }

    const again = await handOverShipmentToLobo(args);

    assert.equal(again.ok, true);
    assert.equal(again.alreadySent, true);
  });

  it("без координат доставки заказ в службу не уходит", async () => {
    const { args, order } = await loboOrder({ withGeo: false });

    for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
      await advanceOrderShipmentStatus({ ...args, nextStatus });
    }

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(
      String(fresh.shipments[0].shippingExternalId ?? ""),
      "",
      "иначе курьер поедет в никуда",
    );
    assert.equal(
      fresh.status,
      "ready_to_ship",
      "ступень при этом сохраняется: продавец свою часть сделал",
    );
  });

  it("отмена до забора груза проходит", async () => {
    const { args } = await loboOrder();
    for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
      await advanceOrderShipmentStatus({ ...args, nextStatus });
    }

    const cancelled = await cancelShipmentInLobo(args);

    assert.equal(cancelled.ok, true);
  });
});
