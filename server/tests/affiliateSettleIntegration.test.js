import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE,
  AFFILIATE_LEDGER_ENTRY_PAYOUT,
  AFFILIATE_LINE_STATUS_PAID,
  AFFILIATE_LINE_STATUS_PENDING,
  AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD,
  AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM,
  computeAffiliatePayoutAmount,
} from "../constants/affiliateConstants.js";
import { ORDER_STATUS_DELIVERED } from "../constants/orderConstants.js";
import { AppError } from "../errors/AppError.js";
import { AffiliateLedgerEntryModel, OrderModel, UserModel } from "../models/index.js";
import { settleAffiliatePayoutForOrderItem } from "../services/affiliate/settleAffiliatePayoutForOrderItem.js";
import { confirmOrderItemByBuyer } from "../services/order/updateOrderItemStatus.js";
import { ORDER_ITEMS_POPULATE } from "../services/order/orderQueries.js";
import { runInTransaction } from "../utils/mongoTransaction.js";
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
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("confirm: affiliate settle — debit seller, credit referrer, ledger payout", async () => {
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

  await confirmOrderItemByBuyer({
    orderId: String(order._id),
    itemIndex: 0,
    buyerId: String(buyer._id),
    userId: String(buyer._id),
  });

  const sellerRow = await UserModel.findById(seller._id).lean();
  const referrerRow = await UserModel.findById(referrer._id).lean();
  const buyerRow = await UserModel.findById(buyer._id).lean();
  const refreshed = await OrderModel.findById(order._id).lean();
  const line = refreshed.items[0];

  assert.equal(line.affiliateStatus, AFFILIATE_LINE_STATUS_PAID);
  assert.equal(line.affiliateAmount, expectedPayout);
  assert.equal(line.affiliatePercentUsed, affiliatePercent);

  assert.equal(sellerRow.userLoyaltyPoints, 500 - expectedPayout);
  assert.equal(referrerRow.userLoyaltyPoints, expectedPayout);
  assert.equal(buyerRow.userLoyaltyPoints, 0);

  const ledger = await AffiliateLedgerEntryModel.find({
    entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
    orderId: order._id,
  }).lean();
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].amount, expectedPayout);
  assert.equal(String(ledger[0].sellerUserId), String(seller._id));
  assert.equal(String(ledger[0].affiliateUserId), String(referrer._id));
  assert.equal(ledger[0].sourceId, `affiliate_payout:${order._id}:${line._id}`);
});

test("confirm: insufficient seller loyalty → 409, no ledger, no credit", async () => {
  const { seller, buyer, referrer, product, affiliatePercent, productPrice } =
    await createAffiliateSettleFixture({ sellerPoints: 5 });

  const expectedPayout = computeAffiliatePayoutAmount(productPrice, affiliatePercent);
  assert.ok(expectedPayout > 5);

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  await assert.rejects(
    () =>
      confirmOrderItemByBuyer({
        orderId: String(order._id),
        itemIndex: 0,
        buyerId: String(buyer._id),
        userId: String(buyer._id),
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 409 &&
      String(error.message).includes(AFFILIATE_INSUFFICIENT_LOYALTY_MESSAGE),
  );

  const sellerRow = await UserModel.findById(seller._id).lean();
  const referrerRow = await UserModel.findById(referrer._id).lean();
  const ledgerCount = await AffiliateLedgerEntryModel.countDocuments({
    entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
  });
  const refreshed = await OrderModel.findById(order._id).lean();

  assert.equal(sellerRow.userLoyaltyPoints, 5);
  assert.equal(referrerRow.userLoyaltyPoints, 0);
  assert.equal(ledgerCount, 0);
  assert.equal(refreshed.items[0].status, ORDER_STATUS_DELIVERED);
  assert.equal(refreshed.items[0].affiliateStatus, AFFILIATE_LINE_STATUS_PENDING);
});

test("confirm: antifraud referrer===buyer → skipped, no ledger", async () => {
  const { seller, buyer, product } = await createAffiliateSettleFixture({
    sellerPoints: 500,
  });

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: buyer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  await confirmOrderItemByBuyer({
    orderId: String(order._id),
    itemIndex: 0,
    buyerId: String(buyer._id),
    userId: String(buyer._id),
  });

  const sellerRow = await UserModel.findById(seller._id).lean();
  const buyerRow = await UserModel.findById(buyer._id).lean();
  const refreshed = await OrderModel.findById(order._id).lean();
  const ledgerCount = await AffiliateLedgerEntryModel.countDocuments({});

  assert.equal(
    refreshed.items[0].affiliateStatus,
    AFFILIATE_LINE_STATUS_SKIPPED_ANTIFRAUD,
  );
  assert.equal(sellerRow.userLoyaltyPoints, 500);
  assert.equal(buyerRow.userLoyaltyPoints, 0);
  assert.equal(ledgerCount, 0);
});

test("confirm: program disabled on product → skipped_no_program", async () => {
  const { seller, buyer, referrer, product } = await createAffiliateSettleFixture({
    sellerPoints: 500,
    affiliateEnabled: false,
    affiliatePercent: 10,
  });

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  await confirmOrderItemByBuyer({
    orderId: String(order._id),
    itemIndex: 0,
    buyerId: String(buyer._id),
    userId: String(buyer._id),
  });

  const referrerRow = await UserModel.findById(referrer._id).lean();
  const refreshed = await OrderModel.findById(order._id).lean();
  const ledgerCount = await AffiliateLedgerEntryModel.countDocuments({});

  assert.equal(
    refreshed.items[0].affiliateStatus,
    AFFILIATE_LINE_STATUS_SKIPPED_NO_PROGRAM,
  );
  assert.equal(referrerRow.userLoyaltyPoints, 0);
  assert.equal(ledgerCount, 0);
});

test("settle idempotent: second settle with same sourceId does not double-credit", async () => {
  const { seller, buyer, referrer, product, affiliatePercent, productPrice } =
    await createAffiliateSettleFixture({ sellerPoints: 500 });
  const expectedPayout = computeAffiliatePayoutAmount(productPrice, affiliatePercent);

  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  await markAffiliateOrderItemDelivered(order._id, 0);

  await confirmOrderItemByBuyer({
    orderId: String(order._id),
    itemIndex: 0,
    buyerId: String(buyer._id),
    userId: String(buyer._id),
  });

  const orderDoc = await OrderModel.findById(order._id).populate(ORDER_ITEMS_POPULATE);
  const targetItem = orderDoc.items[0];
  assert.equal(targetItem.affiliateStatus, AFFILIATE_LINE_STATUS_PAID);

  // Симулируем повтор settle после сбоя UI: статус снова pending, ledger уже есть.
  targetItem.affiliateStatus = AFFILIATE_LINE_STATUS_PENDING;
  targetItem.affiliateAmount = 0;

  const second = await runInTransaction(async (session) => {
    const result = await settleAffiliatePayoutForOrderItem({
      order: orderDoc,
      targetItem,
      buyerId: String(buyer._id),
      session,
    });
    await orderDoc.save({ session });
    return result;
  });

  assert.equal(second.skipped, true);
  assert.equal(second.paid, expectedPayout);

  const sellerRow = await UserModel.findById(seller._id).lean();
  const referrerRow = await UserModel.findById(referrer._id).lean();
  const ledgerCount = await AffiliateLedgerEntryModel.countDocuments({
    entryType: AFFILIATE_LEDGER_ENTRY_PAYOUT,
    orderId: order._id,
  });

  assert.equal(sellerRow.userLoyaltyPoints, 500 - expectedPayout);
  assert.equal(referrerRow.userLoyaltyPoints, expectedPayout);
  assert.equal(ledgerCount, 1);
});
