import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, UserInAppNotificationModel } = await import("../models/index.js");
const { advanceOrderShipmentStatus, resolveNextShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const {
  markOrderItemCancelled,
  markOrderItemDeliveredBySeller,
  markOrderItemShippedBySeller,
} = await import("../services/order/updateOrderItemStatus.js");

/** @param {any} order @param {string} sellerId @param {string} nextStatus */
const advance = (order, sellerId, nextStatus) =>
  advanceOrderShipmentStatus({
    orderId: String(order._id),
    sellerId: String(sellerId),
    nextStatus,
  });

/** @param {any} order @param {"pickup" | "delivery"} method */
const setFulfillment = (order, method, sellerId) =>
  OrderModel.updateOne(
    { _id: order._id },
    {
      $set: {
        fulfillmentMethod: method,
        shipments: [{ sellerId, fulfillmentMethod: method }],
      },
    },
  );

describe("следующая ступень отправления", () => {
  it("самовывоз ведёт к «Готов к выдаче»", () => {
    assert.equal(resolveNextShipmentStatus("pending", "pickup"), "accepted");
    assert.equal(resolveNextShipmentStatus("accepted", "pickup"), "assembling");
    assert.equal(
      resolveNextShipmentStatus("assembling", "pickup"),
      "ready_for_pickup",
    );
  });

  it("доставка ведёт к «Готов к отгрузке»", () => {
    assert.equal(resolveNextShipmentStatus("assembling", "delivery"), "ready_to_ship");
  });

  it("после «Готов» ступеней больше нет", () => {
    assert.equal(resolveNextShipmentStatus("ready_for_pickup", "pickup"), null);
    assert.equal(resolveNextShipmentStatus("ready_to_ship", "delivery"), null);
    assert.equal(resolveNextShipmentStatus("shipped", "delivery"), null);
  });
});

describe("продавец двигает отправление", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("проводит самовывоз до «Готов к выдаче»", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "pickup", seller._id);

    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");
    const { order: fresh } = await advance(order, seller._id, "ready_for_pickup");

    assert.equal(fresh.status, "ready_for_pickup");
    assert.equal(fresh.items[0].status, "ready_for_pickup");
  });

  it("доставку ведёт в «Готов к отгрузке», а не к выдаче", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "delivery", seller._id);

    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");

    await assert.rejects(
      () => advance(order, seller._id, "ready_for_pickup"),
      /ready_to_ship/,
      "ветку самовывоза доставке не подсунуть",
    );

    const { order: fresh } = await advance(order, seller._id, "ready_to_ship");
    assert.equal(fresh.items[0].status, "ready_to_ship");
  });

  it("не даёт перепрыгнуть ступень", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });

    await assert.rejects(
      () => advance(order, seller._id, "assembling"),
      /accepted/,
      "из «В обработке» доступен только «Принят»",
    );
  });

  it("чужое отправление тронуть нельзя", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const stranger = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });

    await assert.rejects(
      () => advance(order, stranger.seller._id, "accepted"),
      /нет ваших позиций/i,
    );
  });

  it("после отгрузки ступеней не осталось", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    await assert.rejects(
      () => advance(order, seller._id, "accepted"),
      /уже прошло эту ступень/,
    );
  });

  it("уведомляет покупателя один раз на ступень", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });

    await advance(order, seller._id, "accepted");

    const notes = await UserInAppNotificationModel.find({ userId: buyer._id }).lean();
    assert.equal(notes.length, 1);
    assert.match(notes[0].message, /принял заказ/i);
  });

  it("отменённая позиция по лестнице не едет", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await markOrderItemCancelled({
      orderId: String(order._id),
      itemIndex: 0,
      requestUserId: String(seller._id),
    });

    await assert.rejects(
      () => advance(order, seller._id, "accepted"),
      /нет ваших позиций/i,
      "в отправлении не осталось живых позиций",
    );
  });
});

describe("ступени не ломают отгрузку и отмену", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("отгрузить можно прямо из «В обработке», минуя ступени", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });

    const { order: fresh } = await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    assert.equal(fresh.items[0].status, "shipped");
  });

  it("отгрузить можно и с «Готов к отгрузке»", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "delivery", seller._id);
    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");
    await advance(order, seller._id, "ready_to_ship");

    const { order: fresh } = await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    assert.equal(fresh.items[0].status, "shipped");
  });

  it("отменить можно с любой ступени, пока товар у продавца", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");

    const { order: fresh } = await markOrderItemCancelled({
      orderId: String(order._id),
      itemIndex: 0,
      requestUserId: String(seller._id),
    });

    assert.equal(fresh.items[0].status, "cancelled");
  });

  it("отменить после отгрузки уже нельзя", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await markOrderItemShippedBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    await assert.rejects(
      () =>
        markOrderItemCancelled({
          orderId: String(order._id),
          itemIndex: 0,
          requestUserId: String(seller._id),
        }),
      /пока товар у продавца/,
    );
  });

  it("самовывоз не отгружают: покупатель забирает сам", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "pickup", seller._id);

    await assert.rejects(
      () =>
        markOrderItemShippedBySeller({
          orderId: String(order._id),
          itemIndex: 0,
          sellerId: String(seller._id),
        }),
      /покупатель забирает сам/,
    );
  });

  it("самовывоз закрывают выдачей прямо с «Готов к выдаче»", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "pickup", seller._id);

    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");
    await advance(order, seller._id, "ready_for_pickup");

    const { order: fresh } = await markOrderItemDeliveredBySeller({
      orderId: String(order._id),
      itemIndex: 0,
      sellerId: String(seller._id),
    });

    assert.equal(fresh.items[0].status, "delivered");
  });

  it("доставку с «Готов к отгрузке» выдачей не закрыть — её ещё везут", async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await setFulfillment(order, "delivery", seller._id);

    await advance(order, seller._id, "accepted");
    await advance(order, seller._id, "assembling");
    await advance(order, seller._id, "ready_to_ship");

    await assert.rejects(
      () =>
        markOrderItemDeliveredBySeller({
          orderId: String(order._id),
          itemIndex: 0,
          sellerId: String(seller._id),
        }),
      /только пока она в пути/,
    );
  });
});
