import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserModel } = await import("../models/index.js");
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const flow = await import("../services/courier/courierShipmentFlow.js");
const { verifyHandoverCode, generateHandoverCode, HANDOVER_CODE_MAX_ATTEMPTS } =
  await import("../services/courier/courierHandoverCodes.js");

/** Заказ доставкой, доведённый продавцом до «Готов к отгрузке». */
async function readyShipment() {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
  const order = await createOrderWithReserveTransaction({ buyer, seller, product });

  await OrderModel.updateOne(
    { _id: order._id },
    {
      $set: {
        fulfillmentMethod: "delivery",
        shipments: [{ sellerId: seller._id, fulfillmentMethod: "delivery", courierDelivery: true }],
      },
    },
  );

  const args = { orderId: String(order._id), sellerId: String(seller._id) };
  await advanceOrderShipmentStatus({ ...args, nextStatus: "accepted" });
  await advanceOrderShipmentStatus({ ...args, nextStatus: "assembling" });
  await advanceOrderShipmentStatus({ ...args, nextStatus: "ready_to_ship" });

  const courier = await UserModel.create({
    userName: `courier-${Math.random().toString(36).slice(2, 8)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userAddress: "г Москва",
    userRegionCode: "RU-MOW",
    courierProfile: { moderationStatus: "approved" },
  });

  return { order, seller, buyer, product, courier, args };
}

/** @param {any} orderId @param {any} sellerId */
const readShipment = async (orderId, sellerId) => {
  const fresh = await OrderModel.findById(orderId).lean();
  return {
    order: fresh,
    shipment: fresh.shipments.find((s) => String(s.sellerId) === String(sellerId)),
  };
};

describe("коды передачи", () => {
  it("код — четыре цифры", () => {
    for (let i = 0; i < 50; i += 1) {
      assert.match(generateHandoverCode(), /^\d{4}$/);
    }
  });

  it("верный код проходит и считает попытку", () => {
    const r = verifyHandoverCode({ expected: "1234", received: "1234", attempts: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.attempts, 1);
  });

  it("неверный код не бросает, но растит счётчик", () => {
    const r = verifyHandoverCode({ expected: "1234", received: "9999", attempts: 2 });
    assert.equal(r.ok, false);
    assert.equal(r.attempts, 3, "иначе лимит попыток ничего не ограничивает");
    assert.equal(r.error.statusCode, 400);
  });

  it("после лимита код сгорает", () => {
    const r = verifyHandoverCode({
      expected: "1234",
      received: "1234",
      attempts: HANDOVER_CODE_MAX_ATTEMPTS,
    });
    assert.equal(r.ok, false);
    assert.equal(r.error.statusCode, 429);
  });

  it("невыданный код не принимает ничего", () => {
    const r = verifyHandoverCode({ expected: "", received: "0000", attempts: 0 });
    assert.equal(r.ok, false);
    assert.equal(r.error.statusCode, 409);
  });

  it("пробелы вокруг кода не мешают", () => {
    assert.equal(
      verifyHandoverCode({ expected: "0042", received: " 0042 ", attempts: 0 }).ok,
      true,
    );
  });
});

describe("курьер ведёт отправление", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("берёт заказ из «Готов к отгрузке»", async () => {
    const { order, seller, courier } = await readyShipment();

    await flow.acceptShipmentByCourier({
      orderId: String(order._id),
      sellerId: String(seller._id),
      courierId: String(courier._id),
    });

    const { order: fresh, shipment } = await readShipment(order._id, seller._id);
    assert.equal(fresh.status, "courier_assigned");
    assert.equal(String(shipment.courierId), String(courier._id));
  });

  it("неподтверждённый курьер заказ не возьмёт", async () => {
    const { order, seller, courier } = await readyShipment();
    await UserModel.updateOne(
      { _id: courier._id },
      { $set: { "courierProfile.moderationStatus": "pending" } },
    );

    await assert.rejects(
      () =>
        flow.acceptShipmentByCourier({
          orderId: String(order._id),
          sellerId: String(seller._id),
          courierId: String(courier._id),
        }),
      /подтверждённые курьеры/i,
    );
  });

  it("самовывозное отправление курьеру недоступно", async () => {
    const { order, seller, courier } = await readyShipment();
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { "shipments.0.fulfillmentMethod": "pickup" } },
    );

    await assert.rejects(
      () =>
        flow.acceptShipmentByCourier({
          orderId: String(order._id),
          sellerId: String(seller._id),
          courierId: String(courier._id),
        }),
      /самовывоз/i,
    );
  });

  it("второй курьер на занятое отправление не встанет", async () => {
    const { order, seller, courier } = await readyShipment();
    const other = await UserModel.create({
      userName: "other-courier",
      email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
      passwordHash: "x".repeat(60),
      courierProfile: { moderationStatus: "approved" },
    });
    const ids = { orderId: String(order._id), sellerId: String(seller._id) };

    await flow.acceptShipmentByCourier({ ...ids, courierId: String(courier._id) });

    await assert.rejects(
      () => flow.acceptShipmentByCourier({ ...ids, courierId: String(other._id) }),
      /другой курьер/i,
    );
  });
});

describe("передача по коду", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** Доводит до состояния «курьер принял, код выдан». */
  async function withCode() {
    const ctx = await readyShipment();
    const ids = {
      orderId: String(ctx.order._id),
      sellerId: String(ctx.seller._id),
    };
    await flow.acceptShipmentByCourier({ ...ids, courierId: String(ctx.courier._id) });
    const { code } = await flow.issueHandoverCode(ids);
    return { ...ctx, ids, code };
  }

  it("продавец выдаёт код, курьер вводит — товар у него", async () => {
    const { ids, code, courier, seller, order } = await withCode();

    await flow.confirmHandoverByCourier({
      ...ids,
      courierId: String(courier._id),
      code,
    });

    const { order: fresh, shipment } = await readShipment(order._id, seller._id);
    assert.equal(fresh.status, "courier_holding");
    assert.equal(shipment.handoverCode, "", "использованный код не хранится");
  });

  it("неверный код не двигает статус, но тратит попытку", async () => {
    const { ids, courier, seller, order } = await withCode();

    await assert.rejects(
      () =>
        flow.confirmHandoverByCourier({
          ...ids,
          courierId: String(courier._id),
          code: "0000",
        }),
      /неверный код/i,
    );

    const { order: fresh, shipment } = await readShipment(order._id, seller._id);
    assert.equal(fresh.status, "courier_assigned", "статус не сдвинулся");
    assert.equal(shipment.handoverAttempts, 1, "попытка записана в документ");
  });

  it("код выдаётся только когда курьер уже принял заказ", async () => {
    const { order, seller } = await readyShipment();

    await assert.rejects(
      () =>
        flow.issueHandoverCode({
          orderId: String(order._id),
          sellerId: String(seller._id),
        }),
      /когда курьер приехал/i,
    );
  });

  it("чужой курьер код не введёт", async () => {
    const { ids, code } = await withCode();
    const stranger = await UserModel.create({
      userName: "stranger",
      email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
      passwordHash: "x".repeat(60),
      courierProfile: { moderationStatus: "approved" },
    });

    await assert.rejects(
      () =>
        flow.confirmHandoverByCourier({
          ...ids,
          courierId: String(stranger._id),
          code,
        }),
      /другой курьер/i,
    );
  });
});

describe("доставка до подтверждения", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** Доводит до «товар у курьера». */
  async function holding() {
    const ctx = await readyShipment();
    const ids = { orderId: String(ctx.order._id), sellerId: String(ctx.seller._id) };
    const courierId = String(ctx.courier._id);
    await flow.acceptShipmentByCourier({ ...ids, courierId });
    const { code } = await flow.issueHandoverCode(ids);
    await flow.confirmHandoverByCourier({ ...ids, courierId, code });
    return { ...ctx, ids, courierId };
  }

  it("вся лестница до подтверждения", async () => {
    const { ids, courierId, order, seller, product } = await holding();

    await flow.startDeliveryByCourier({ ...ids, courierId });
    assert.equal((await readShipment(order._id, seller._id)).order.status, "in_delivery");

    await flow.markArrivedByCourier({ ...ids, courierId });
    const arrived = await readShipment(order._id, seller._id);
    assert.equal(arrived.order.status, "delivered");
    assert.match(arrived.shipment.deliveryCode, /^\d{4}$/);

    await flow.completeDeliveryByCourier({
      ...ids,
      courierId,
      code: arrived.shipment.deliveryCode,
    });

    const done = await readShipment(order._id, seller._id);
    assert.equal(done.order.status, "confirmed");
    assert.equal(done.shipment.deliveryCode, "");

    const { ProductModel } = await import("../models/index.js");
    const sold = await ProductModel.findById(product._id).select("soldQuantity").lean();
    assert.equal(sold.soldQuantity, 1, "счётчик продаж не потерялся при курьерском пути");
  });

  it("подтверждение начисляет баллы, а не просто меняет статус", async () => {
    const { ids, courierId, order, seller, buyer } = await holding();
    await flow.startDeliveryByCourier({ ...ids, courierId });
    await flow.markArrivedByCourier({ ...ids, courierId });
    const arrived = await readShipment(order._id, seller._id);

    await flow.completeDeliveryByCourier({
      ...ids,
      courierId,
      code: arrived.shipment.deliveryCode,
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(
      fresh.items[0].loyaltyPointsAwarded,
      true,
      "денежные эффекты подтверждения отработали",
    );
    assert.ok(buyer._id);
  });

  it("нельзя выехать, не забрав товар", async () => {
    const { order, seller, courier } = await readyShipment();
    const ids = { orderId: String(order._id), sellerId: String(seller._id) };
    await flow.acceptShipmentByCourier({ ...ids, courierId: String(courier._id) });

    await assert.rejects(
      () => flow.startDeliveryByCourier({ ...ids, courierId: String(courier._id) }),
      /заберите заказ/i,
    );
  });

  it("нельзя вручить, не отметив приезд", async () => {
    const { ids, courierId } = await holding();
    await flow.startDeliveryByCourier({ ...ids, courierId });

    await assert.rejects(
      () => flow.completeDeliveryByCourier({ ...ids, courierId, code: "1234" }),
      /привезли заказ/i,
    );
  });
});
