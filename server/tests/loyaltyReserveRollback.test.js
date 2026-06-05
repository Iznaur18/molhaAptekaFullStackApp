import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { UserModel } from "../models/index.js";
import {
  reserveLoyaltyPointsBySellerTotals,
  releaseLoyaltyPointsBySellerTotals,
} from "../utils/loyaltyPointsReserve.js";
import { runInTransaction } from "../utils/mongoTransaction.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("reserve откатывается при abort транзакции до create order", async () => {
  const seller = await UserModel.create({
    userName: "seller_reserve_test",
    email: `seller_${Date.now()}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: 100,
    userLoyaltyPointsReserved: 0,
  });

  const totals = [{ sellerId: String(seller._id), amount: 40 }];

  try {
    await runInTransaction(async (session) => {
      await reserveLoyaltyPointsBySellerTotals(totals, session);
      throw new Error("ORDER_CREATE_FAILED");
    });
  } catch (error) {
    assert.equal(error.message, "ORDER_CREATE_FAILED");
  }

  const refreshed = await UserModel.findById(seller._id).lean();
  assert.equal(refreshed.userLoyaltyPointsReserved, 0);
});

test("releaseLoyaltyPointsBySellerTotals снимает резерв", async () => {
  const seller = await UserModel.create({
    userName: "seller_release_test",
    email: `seller_rel_${Date.now()}@test.local`,
    passwordHash: "hash",
    userLoyaltyPoints: 50,
    userLoyaltyPointsReserved: 0,
  });

  const totals = [{ sellerId: String(seller._id), amount: 20 }];
  await reserveLoyaltyPointsBySellerTotals(totals);

  let row = await UserModel.findById(seller._id).lean();
  assert.equal(row.userLoyaltyPointsReserved, 20);

  await releaseLoyaltyPointsBySellerTotals(totals);
  row = await UserModel.findById(seller._id).lean();
  assert.equal(row.userLoyaltyPointsReserved, 0);
});
