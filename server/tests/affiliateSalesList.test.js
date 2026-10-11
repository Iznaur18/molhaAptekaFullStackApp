import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  AFFILIATE_LINE_STATUS_PAID,
  AFFILIATE_LINE_STATUS_PENDING,
} from "../constants/affiliateConstants.js";
import { AffiliateLedgerEntryModel } from "../models/index.js";
import { getMyAffiliateEarnings } from "../services/affiliate/getMyAffiliateEarnings.js";
import { getMyAffiliateSales } from "../services/affiliate/getMyAffiliateSales.js";
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
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("продавец видит продажу через партнёра: кто привёл и кто купил", async () => {
  const { seller, buyer, referrer, product } = await createAffiliateSettleFixture();
  const order = await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });

  const { rows } = await getMyAffiliateSales({ userId: String(seller._id) });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].orderId, String(order._id));
  assert.equal(rows[0].partnerName, referrer.userName);
  assert.equal(rows[0].buyerName, buyer.userName);
  assert.equal(rows[0].status, AFFILIATE_LINE_STATUS_PENDING);
});

test("чужие продажи и заказы без партнёра в список не попадают", async () => {
  const { seller, buyer, referrer, product } = await createAffiliateSettleFixture();
  await createAffiliatePendingOrder({ buyer, seller, product, referrerUserId: null });

  const own = await getMyAffiliateSales({ userId: String(seller._id) });
  assert.equal(own.rows.length, 0);

  await createAffiliatePendingOrder({
    buyer,
    seller,
    product,
    referrerUserId: referrer._id,
  });
  const partnerView = await getMyAffiliateSales({ userId: String(referrer._id) });
  const buyerView = await getMyAffiliateSales({ userId: String(buyer._id) });
  assert.equal(partnerView.rows.length, 0);
  assert.equal(buyerView.rows.length, 0);
});

test("партнёр в начислениях видит продавца и покупателя", async () => {
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
  await confirmOrderItemByBuyer({
    orderId: String(order._id),
    itemIndex: 0,
    buyerId: String(buyer._id),
    userId: String(buyer._id),
  });

  const earnings = await getMyAffiliateEarnings(String(referrer._id));
  assert.equal(earnings.rows.length, 1);
  assert.equal(earnings.rows[0].sellerName, seller.userName);
  assert.equal(earnings.rows[0].buyerName, buyer.userName);

  const sales = await getMyAffiliateSales({ userId: String(seller._id) });
  assert.equal(sales.rows[0].status, AFFILIATE_LINE_STATUS_PAID);
  assert.ok(sales.rows[0].amount > 0);
});
