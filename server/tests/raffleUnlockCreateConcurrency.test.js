import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";

import { RAFFLE_CREATE_PRICE_POINTS } from "../constants/raffleConstants.js";
import { UserModel } from "../models/index.js";
import {
  cancelRaffleCreateUnlock,
  unlockRaffleCreate,
} from "../services/raffle/raffleCreateAccess.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

const START_POINTS = RAFFLE_CREATE_PRICE_POINTS * 4;

const createSeller = async () => {
  const seller = await UserModel.create({
    userName: `seller_${new mongoose.Types.ObjectId().toString().slice(-8)}`,
    email: `${new mongoose.Types.ObjectId().toString()}@example.test`,
    passwordHash: "x".repeat(20),
    isUserDataConfirmed: true,
    userLoyaltyPoints: START_POINTS,
    userLoyaltyPointsReserved: 0,
  });
  return String(seller._id);
};

const readPoints = async (sellerId) => {
  const row = await UserModel.findById(sellerId)
    .select("userLoyaltyPoints userLoyaltyPointsReserved raffleCreateUnlockAt")
    .lean();
  return {
    points: Number(row?.userLoyaltyPoints) || 0,
    reserved: Number(row?.userLoyaltyPointsReserved) || 0,
    unlockedAt: row?.raffleCreateUnlockAt ?? null,
  };
};

test("параллельные unlock-create резервируют баллы ровно один раз", async () => {
  const sellerId = await createSeller();

  const results = await Promise.allSettled([
    unlockRaffleCreate({ sellerId }),
    unlockRaffleCreate({ sellerId }),
    unlockRaffleCreate({ sellerId }),
  ]);

  const fulfilled = results.filter((row) => row.status === "fulfilled");
  assert.equal(
    fulfilled.length,
    3,
    "все параллельные вызовы должны завершиться успехом",
  );
  for (const row of fulfilled) {
    assert.equal(row.value.hasPaidUnlock, true);
  }

  const state = await readPoints(sellerId);
  assert.equal(
    state.reserved,
    RAFFLE_CREATE_PRICE_POINTS,
    "зарезервировано должно быть ровно одно списание, а не N",
  );
  assert.ok(state.unlockedAt instanceof Date);
});

test("cancel после параллельных unlock освобождает резерв полностью", async () => {
  const sellerId = await createSeller();

  await Promise.allSettled([
    unlockRaffleCreate({ sellerId }),
    unlockRaffleCreate({ sellerId }),
  ]);
  await cancelRaffleCreateUnlock({ sellerId });

  const state = await readPoints(sellerId);
  assert.equal(state.reserved, 0, "после отмены баллы не должны залипать в reserved");
  assert.equal(state.points, START_POINTS);
  assert.equal(state.unlockedAt, null);
});

test("повторный последовательный unlock не резервирует повторно", async () => {
  const sellerId = await createSeller();

  const first = await unlockRaffleCreate({ sellerId });
  const second = await unlockRaffleCreate({ sellerId });

  assert.equal(first.hasPaidUnlock, true);
  assert.equal(second.hasPaidUnlock, true);
  const state = await readPoints(sellerId);
  assert.equal(state.reserved, RAFFLE_CREATE_PRICE_POINTS);
});
