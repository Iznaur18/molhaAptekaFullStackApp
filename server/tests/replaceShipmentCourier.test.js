import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserInAppNotificationModel, UserModel } = await import(
  "../models/index.js"
);
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const flow = await import("../services/courier/courierShipmentFlow.js");
const { replaceShipmentCourier } = await import(
  "../services/courier/replaceShipmentCourier.js"
);

/** @param {string} [name] */
const makeCourier = (name = "courier") =>
  UserModel.create({
    userName: `${name}-${Math.random().toString(36).slice(2, 8)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userAddress: "г Москва",
    userRegionCode: "RU-MOW",
    courierProfile: { moderationStatus: "approved" },
  });

/** Отправление с курьером, принявшим заказ. */
async function assignedShipment() {
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
  await advanceOrderShipmentStatus({ ...args, nextStatus: "accepted" });
  await advanceOrderShipmentStatus({ ...args, nextStatus: "assembling" });
  await advanceOrderShipmentStatus({ ...args, nextStatus: "ready_to_ship" });

  const courier = await makeCourier();
  await flow.acceptShipmentByCourier({ ...args, courierId: String(courier._id) });

  return { order, seller, buyer, product, courier, args };
}

/** @param {any} orderId */
const readShipment = async (orderId) => {
  const fresh = await OrderModel.findById(orderId).lean();
  return { order: fresh, shipment: fresh.shipments[0] };
};

describe("смена курьера", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("продавец возвращает отправление в общий список", async () => {
    const { args, seller, order, courier } = await assignedShipment();

    await replaceShipmentCourier({ ...args, requestUserId: String(seller._id) });

    const { order: fresh, shipment } = await readShipment(order._id);
    assert.equal(fresh.status, "ready_to_ship", "заказ снова свободен");
    assert.equal(shipment.courierId, null);
    assert.deepEqual(
      shipment.declinedCourierIds.map(String),
      [String(courier._id)],
      "иначе курьер тут же возьмёт заказ снова, и отказ ничего не изменит",
    );
  });

  it("покупатель тоже может сменить курьера", async () => {
    const { args, buyer, order } = await assignedShipment();

    await replaceShipmentCourier({ ...args, requestUserId: String(buyer._id) });

    assert.equal((await readShipment(order._id)).order.status, "ready_to_ship");
  });

  it("отказанный курьер заказ повторно не возьмёт", async () => {
    const { args, seller, courier } = await assignedShipment();
    await replaceShipmentCourier({ ...args, requestUserId: String(seller._id) });

    await assert.rejects(
      () => flow.acceptShipmentByCourier({ ...args, courierId: String(courier._id) }),
      /вам отказали/i,
    );
  });

  it("другой курьер заказ берёт свободно", async () => {
    const { args, seller, order } = await assignedShipment();
    await replaceShipmentCourier({ ...args, requestUserId: String(seller._id) });

    const next = await makeCourier("next");
    await flow.acceptShipmentByCourier({ ...args, courierId: String(next._id) });

    const { shipment } = await readShipment(order._id);
    assert.equal(String(shipment.courierId), String(next._id));
  });

  it("выданный код передачи сгорает", async () => {
    const { args, seller, order } = await assignedShipment();
    await flow.issueHandoverCode(args);
    assert.notEqual((await readShipment(order._id)).shipment.handoverCode, "");

    await replaceShipmentCourier({ ...args, requestUserId: String(seller._id) });

    assert.equal(
      (await readShipment(order._id)).shipment.handoverCode,
      "",
      "старый код не должен открывать передачу новому курьеру",
    );
  });

  it("после передачи товара это уже возврат, а не смена", async () => {
    const { args, seller, courier } = await assignedShipment();
    const { code } = await flow.issueHandoverCode(args);
    await flow.confirmHandoverByCourier({
      ...args,
      courierId: String(courier._id),
      code,
    });

    await assert.rejects(
      () => replaceShipmentCourier({ ...args, requestUserId: String(seller._id) }),
      /это возврат/i,
    );
  });

  it("без назначенного курьера менять некого", async () => {
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
            },
          ],
        },
      },
    );

    await assert.rejects(
      () =>
        replaceShipmentCourier({
          orderId: String(order._id),
          sellerId: String(seller._id),
          requestUserId: String(seller._id),
        }),
      /ещё не принял/i,
    );
  });

  it("посторонний курьера не сменит", async () => {
    const { args } = await assignedShipment();
    const stranger = await createOrderLoyaltyFixture();

    await assert.rejects(
      () =>
        replaceShipmentCourier({ ...args, requestUserId: String(stranger.buyer._id) }),
      /продавец и покупатель/i,
    );
  });

  it("курьер узнаёт, что заказ у него забрали", async () => {
    const { args, seller, courier } = await assignedShipment();

    await replaceShipmentCourier({ ...args, requestUserId: String(seller._id) });

    const notes = await UserInAppNotificationModel.find({
      userId: courier._id,
      kind: "courier_replaced",
    }).lean();
    assert.equal(notes.length, 1);
    assert.match(notes[0].message, /другому курьеру/i);
  });
});
