import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { ORDER_STATUS_DELIVERED } from "../constants/orderConstants.js";
import { OrderModel, UserModel } from "../models/index.js";
import {
  cancelOrderItemLoyaltyTransaction,
  confirmOrderItemLoyaltyTransaction,
  createOrderLoyaltyFixture,
  createOrderWithReserveTransaction,
  markOrderItemDelivered,
} from "./helpers/orderLoyaltyTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("create order + reserve: резерв продавца увеличивается", async () => {
  const { seller, buyer, product, loyaltyPointsPerUnit } =
    await createOrderLoyaltyFixture();

  const order = await createOrderWithReserveTransaction({
    buyer,
    seller,
    product,
    quantity: 2,
  });

  assert.ok(order._id);

  const sellerRow = await UserModel.findById(seller._id).lean();
  assert.equal(sellerRow.userLoyaltyPointsReserved, loyaltyPointsPerUnit * 2);
  assert.equal(sellerRow.userLoyaltyPoints, 200);
});

test("confirm: settle баллов продавец → подтверждённый покупатель", async () => {
  const { seller, buyer, product, loyaltyPointsPerUnit } =
    await createOrderLoyaltyFixture();

  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await markOrderItemDelivered(order._id, 0);

  const pointsEarned = await confirmOrderItemLoyaltyTransaction({
    orderId: order._id,
    itemIndex: 0,
    buyerId: buyer._id,
  });

  assert.equal(pointsEarned, loyaltyPointsPerUnit);

  const sellerRow = await UserModel.findById(seller._id).lean();
  const buyerRow = await UserModel.findById(buyer._id).lean();

  assert.equal(sellerRow.userLoyaltyPoints, 200 - loyaltyPointsPerUnit);
  assert.equal(sellerRow.userLoyaltyPointsReserved, 0);
  assert.equal(buyerRow.userLoyaltyPoints, loyaltyPointsPerUnit);
});

test("cancel item: release резерва продавца", async () => {
  const { seller, buyer, product, loyaltyPointsPerUnit } =
    await createOrderLoyaltyFixture();

  const order = await createOrderWithReserveTransaction({ buyer, seller, product });

  await cancelOrderItemLoyaltyTransaction({ orderId: order._id, itemIndex: 0 });

  const sellerRow = await UserModel.findById(seller._id).lean();
  assert.equal(sellerRow.userLoyaltyPointsReserved, 0);
  assert.equal(sellerRow.userLoyaltyPoints, 200);

  const buyerRow = await UserModel.findById(buyer._id).lean();
  assert.equal(buyerRow.userLoyaltyPoints, 0);
  assert.equal(loyaltyPointsPerUnit, 20);
});

test("double confirm idempotent: второй confirm не начисляет баллы повторно", async () => {
  const { seller, buyer, product, loyaltyPointsPerUnit } =
    await createOrderLoyaltyFixture();

  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await markOrderItemDelivered(order._id, 0);

  const firstEarned = await confirmOrderItemLoyaltyTransaction({
    orderId: order._id,
    itemIndex: 0,
    buyerId: buyer._id,
  });
  assert.equal(firstEarned, loyaltyPointsPerUnit);

  const buyerAfterFirst = await UserModel.findById(buyer._id).lean();
  assert.equal(buyerAfterFirst.userLoyaltyPoints, loyaltyPointsPerUnit);

  await assert.rejects(
    () =>
      confirmOrderItemLoyaltyTransaction({
        orderId: order._id,
        itemIndex: 0,
        buyerId: buyer._id,
      }),
    (error) => error?.code === "CONFIRM_WRONG_STATUS",
  );

  const buyerAfterReject = await UserModel.findById(buyer._id).lean();
  assert.equal(buyerAfterReject.userLoyaltyPoints, loyaltyPointsPerUnit);

  await OrderModel.updateOne(
    { _id: order._id, "items.0": { $exists: true } },
    { $set: { "items.0.status": ORDER_STATUS_DELIVERED } },
  );

  const idempotentEarned = await confirmOrderItemLoyaltyTransaction({
    orderId: order._id,
    itemIndex: 0,
    buyerId: buyer._id,
  });
  assert.equal(idempotentEarned, loyaltyPointsPerUnit);

  const buyerFinal = await UserModel.findById(buyer._id).lean();
  assert.equal(buyerFinal.userLoyaltyPoints, loyaltyPointsPerUnit);

  const sellerFinal = await UserModel.findById(seller._id).lean();
  assert.equal(sellerFinal.userLoyaltyPoints, 200 - loyaltyPointsPerUnit);
  assert.equal(sellerFinal.userLoyaltyPointsReserved, 0);
});

test("confirm: без подтверждённых данных покупатель не получает баллы", async () => {
  const { seller, buyer, product, loyaltyPointsPerUnit } =
    await createOrderLoyaltyFixture({ buyerDataConfirmed: false });

  const order = await createOrderWithReserveTransaction({ buyer, seller, product });
  await markOrderItemDelivered(order._id, 0);

  const pointsEarned = await confirmOrderItemLoyaltyTransaction({
    orderId: order._id,
    itemIndex: 0,
    buyerId: buyer._id,
    isUserDataConfirmed: false,
  });

  assert.equal(pointsEarned, 0);

  const buyerRow = await UserModel.findById(buyer._id).lean();
  assert.equal(buyerRow.userLoyaltyPoints, 0);
  assert.equal(buyerRow.isUserDataConfirmed, false);
});
