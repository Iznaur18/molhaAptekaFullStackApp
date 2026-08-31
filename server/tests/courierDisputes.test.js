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
const disputes = await import("../services/courier/courierDisputes.js");
const { processCourierStuckShipmentCronTasks } = await import(
  "../services/courier/courierStuckShipmentsCron.js"
);
const { getReservedQuantityByProductIds } = await import(
  "../services/product/productStock.js"
);

/** Курьерское отправление, доведённое до нужной ступени. */
async function shipmentAt(target = "courier_assigned") {
  const { seller, buyer, product } = await createOrderLoyaltyFixture();
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
            courierDelivery: true,
            deliveryFeeRub: 250,
          },
        ],
      },
    },
  );

  const args = { orderId: String(order._id), sellerId: String(seller._id) };
  for (const nextStatus of ["accepted", "assembling", "ready_to_ship"]) {
    await advanceOrderShipmentStatus({ ...args, nextStatus });
  }

  const courier = await UserModel.create({
    userName: `c-${Math.random().toString(36).slice(2, 8)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    courierProfile: { moderationStatus: "approved" },
  });
  const courierId = String(courier._id);
  await flow.acceptShipmentByCourier({ ...args, courierId });

  if (target !== "courier_assigned") {
    const { code } = await flow.issueHandoverCode(args);
    await flow.confirmHandoverByCourier({ ...args, courierId, code });
  }
  if (target === "in_delivery" || target === "delivered") {
    await flow.startDeliveryByCourier({ ...args, courierId });
  }
  if (target === "delivered") {
    await flow.markArrivedByCourier({ ...args, courierId });
  }

  return { order, seller, buyer, product, courier, courierId, args };
}

describe("курьер отказывается от заявки", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("отправление возвращается в общий список, а не отменяется", async () => {
    const { args, courierId, order } = await shipmentAt();

    await disputes.declineShipmentByCourier({ ...args, courierId });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(
      fresh.status,
      "ready_to_ship",
      "иначе один недобросовестный курьер убивал бы чужие заказы",
    );
    assert.equal(fresh.shipments[0].courierId, null);
  });

  it("отказ пишется в счётчик курьера", async () => {
    const { args, courierId, courier } = await shipmentAt();

    await disputes.declineShipmentByCourier({ ...args, courierId });

    const fresh = await UserModel.findById(courier._id).lean();
    assert.equal(fresh.courierProfile.declinedJobCount, 1);
  });

  it("отказавшийся курьер заказ повторно не возьмёт", async () => {
    const { args, courierId } = await shipmentAt();
    await disputes.declineShipmentByCourier({ ...args, courierId });

    await assert.rejects(
      () => flow.acceptShipmentByCourier({ ...args, courierId }),
      /вам отказали/i,
    );
  });

  it("с товаром на руках отказаться нельзя", async () => {
    const { args, courierId } = await shipmentAt("courier_holding");

    await assert.rejects(
      () => disputes.declineShipmentByCourier({ ...args, courierId }),
      /через возврат/i,
    );
  });
});

describe("спор", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("продавец открывает спор, когда товар у курьера", async () => {
    const { args, seller, order } = await shipmentAt("courier_holding");

    await disputes.openShipmentDispute({
      ...args,
      requestUserId: String(seller._id),
      reason: "Курьер не выходит на связь",
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "disputed");
    assert.ok(fresh.shipments[0].disputeOpenedAt);
    assert.match(fresh.shipments[0].disputeReason, /не выходит на связь/);
  });

  it("до передачи товара спора нет — это отказ", async () => {
    const { args, seller } = await shipmentAt();

    await assert.rejects(
      () =>
        disputes.openShipmentDispute({ ...args, requestUserId: String(seller._id) }),
      /когда товар уже у курьера/i,
    );
  });

  it("спор не возвращает товар на витрину", async () => {
    const { args, seller, product } = await shipmentAt("in_delivery");

    await disputes.openShipmentDispute({ ...args, requestUserId: String(seller._id) });

    const reserved = await getReservedQuantityByProductIds([String(product._id)]);
    assert.equal(
      reserved[String(product._id)],
      1,
      "иначе продадим то, что неизвестно где",
    );
  });

  it("повторно спор не открывается", async () => {
    const { args, seller } = await shipmentAt("courier_holding");
    await disputes.openShipmentDispute({ ...args, requestUserId: String(seller._id) });

    await assert.rejects(
      () =>
        disputes.openShipmentDispute({ ...args, requestUserId: String(seller._id) }),
      /уже открыт/i,
    );
  });

  it("посторонний спор не откроет", async () => {
    const { args } = await shipmentAt("courier_holding");
    const stranger = await createOrderLoyaltyFixture();

    await assert.rejects(
      () =>
        disputes.openShipmentDispute({
          ...args,
          requestUserId: String(stranger.buyer._id),
        }),
      /продавец и покупатель/i,
    );
  });

  it("таймер находит зависшее у курьера отправление", async () => {
    const { args, order } = await shipmentAt("courier_holding");
    // Двигаем назначение на двое суток назад.
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          "shipments.0.courierAssignedAt": new Date(Date.now() - 48 * 3600 * 1000),
        },
      },
    );

    const stuck = await disputes.findStuckCourierShipments();

    assert.equal(stuck.length, 1);
    assert.equal(stuck[0].orderId, args.orderId);
  });

  it("свежее отправление таймер не трогает", async () => {
    await shipmentAt("courier_holding");

    assert.deepEqual(await disputes.findStuckCourierShipments(), []);
  });

  it("уже спорное таймер повторно не поднимает", async () => {
    const { args, seller, order } = await shipmentAt("courier_holding");
    await disputes.openShipmentDispute({ ...args, requestUserId: String(seller._id) });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          "shipments.0.courierAssignedAt": new Date(Date.now() - 48 * 3600 * 1000),
        },
      },
    );

    assert.deepEqual(await disputes.findStuckCourierShipments(), []);
  });
});

describe("разбор спора модератором", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** @param {"returned" | "confirmed"} outcome */
  async function disputed() {
    const ctx = await shipmentAt("in_delivery");
    await disputes.openShipmentDispute({
      ...ctx.args,
      requestUserId: String(ctx.seller._id),
    });
    return ctx;
  }

  it("очередь показывает открытый спор", async () => {
    const { args } = await disputed();

    const { disputes: rows } = await disputes.listOpenDisputes();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].orderId, args.orderId);
    assert.ok(rows[0].sellerName, "модератору нужно, к кому обращаться");
  });

  it("исход «вернулся» освобождает остаток", async () => {
    const { args, seller, product } = await disputed();

    await disputes.resolveShipmentDispute({
      ...args,
      outcome: "returned",
      moderatorId: String(seller._id),
    });

    const reserved = await getReservedQuantityByProductIds([String(product._id)]);
    assert.equal(reserved[String(product._id)] ?? 0, 0);
  });

  it("исход «дошёл» закрывает сделку через штатное подтверждение", async () => {
    const { args, seller, order } = await disputed();

    await disputes.resolveShipmentDispute({
      ...args,
      outcome: "confirmed",
      moderatorId: String(seller._id),
    });

    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "confirmed");
    assert.equal(
      fresh.items[0].loyaltyPointsAwarded,
      true,
      "денежные эффекты не потерялись",
    );
  });

  it("закрывать нечего, если спора нет", async () => {
    const { args, seller } = await shipmentAt("in_delivery");

    await assert.rejects(
      () =>
        disputes.resolveShipmentDispute({
          ...args,
          outcome: "returned",
          moderatorId: String(seller._id),
        }),
      /спора нет/i,
    );
  });
});

describe("таймер срывов", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("поднимает спор без участия продавца", async () => {
    const { order } = await shipmentAt("courier_holding");
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          "shipments.0.courierAssignedAt": new Date(Date.now() - 48 * 3600 * 1000),
        },
      },
    );

    const result = await processCourierStuckShipmentCronTasks();

    assert.deepEqual(result, { opened: 1, failed: 0 });
    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.status, "disputed");
  });

  it("на пустом прогоне ничего не делает", async () => {
    await shipmentAt("courier_holding");

    assert.deepEqual(await processCourierStuckShipmentCronTasks(), {
      opened: 0,
      failed: 0,
    });
  });
});
