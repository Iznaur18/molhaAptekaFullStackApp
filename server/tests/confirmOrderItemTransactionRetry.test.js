import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";

import {
  AFFILIATE_LEDGER_ENTRY_PAYOUT,
  AFFILIATE_LINE_STATUS_PAID,
  computeAffiliatePayoutAmount,
} from "../constants/affiliateConstants.js";
import { ORDER_STATUS_CONFIRMED } from "../constants/orderConstants.js";
import {
  AffiliateLedgerEntryModel,
  OrderModel,
  ProductModel,
  UserModel,
} from "../models/index.js";
import { confirmOrderItemByBuyer } from "../services/order/updateOrderItemStatus.js";
import {
  createAffiliatePendingOrder,
  createAffiliateSettleFixture,
  markAffiliateOrderItemDelivered,
} from "./helpers/affiliateSettleTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
  await AffiliateLedgerEntryModel.syncIndexes();
  // Досоздание индексов на лету — это тоже catalog change, и Mongo валит им
  // транзакцию вместо ожидаемого WriteConflict. Строим заранее.
  await Promise.all(
    [AffiliateLedgerEntryModel, OrderModel, ProductModel, UserModel].map((model) =>
      model.init(),
    ),
  );
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
  // Коллекции должны существовать до транзакций, иначе Mongo отвечает
  // "catalog changes" вместо ожидаемого WriteConflict.
  await Promise.all([
    OrderModel.createCollection(),
    ProductModel.createCollection(),
    UserModel.createCollection(),
    AffiliateLedgerEntryModel.createCollection(),
  ]);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Держит незакоммиченную запись в документ товара: транзакция confirm'а
 * успевает сделать `order.save()`, а затем падает на списании остатка
 * (`decrementProductStockOnItemConfirmed`) с WriteConflict → `withTransaction`
 * повторяет колбэк.
 *
 * Это ровно тот сценарий, в котором mongoose терял мутации: после успешного
 * `save()` документ считается чистым, и повторный проход по документу,
 * загруженному СНАРУЖИ транзакции, не записывал ничего.
 */
async function withBlockingProductWrite(productId, run) {
  const blocker = await mongoose.startSession();
  blocker.startTransaction();
  await ProductModel.updateOne(
    { _id: productId },
    { $inc: { stockReserveGuardTick: 1 } },
    { session: blocker },
  );

  try {
    const pending = run();
    // Даём confirm'у дойти до конфликтующей записи и уйти в ретрай.
    await sleep(400);
    await blocker.commitTransaction();
    return await pending;
  } finally {
    await blocker.endSession();
  }
}

test("confirm переживает ретрай транзакции: позиция подтверждена, деньги проведены один раз", async () => {
  const { seller, buyer, referrer, product, affiliatePercent, productPrice } =
    await createAffiliateSettleFixture({ sellerPoints: 500 });

  const expectedPayout = computeAffiliatePayoutAmount(productPrice, affiliatePercent);
  assert.ok(expectedPayout > 0);

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  await withBlockingProductWrite(product._id, () =>
    confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    }),
  );

  const refreshed = await OrderModel.findById(order._id).lean();
  const line = refreshed.items[0];

  assert.equal(
    line.status,
    ORDER_STATUS_CONFIRMED,
    "статус позиции обязан долететь до БД, а не потеряться на ретрае",
  );
  assert.equal(line.affiliateStatus, AFFILIATE_LINE_STATUS_PAID);
  assert.equal(line.affiliateAmount, expectedPayout);

  const sellerRow = await UserModel.findById(seller._id).lean();
  const referrerRow = await UserModel.findById(referrer._id).lean();
  assert.equal(
    sellerRow.userLoyaltyPoints,
    500 - expectedPayout,
    "продавец должен быть списан ровно один раз",
  );
  assert.equal(referrerRow.userLoyaltyPoints, expectedPayout);

  const ledger = await AffiliateLedgerEntryModel.find({
    entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
    orderId: order._id,
  }).lean();
  assert.equal(ledger.length, 1, "ретрай не должен плодить вторую выплату");

  const productRow = await ProductModel.findById(product._id).lean();
  assert.equal(productRow.productStockQuantity, 9, "остаток списан один раз");
});

test("ответ confirm'а отражает состояние БД, а не документ из памяти", async () => {
  const { seller, buyer, referrer, product } = await createAffiliateSettleFixture({
    sellerPoints: 500,
  });

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  const { order: returned } = await withBlockingProductWrite(product._id, () =>
    confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    }),
  );

  const fromDb = await OrderModel.findById(order._id).lean();
  assert.equal(returned.items[0].status, fromDb.items[0].status);
  assert.equal(returned.status, fromDb.status);
});
