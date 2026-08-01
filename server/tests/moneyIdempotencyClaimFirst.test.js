import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import mongoose from "mongoose";

import { AppError } from "../errors/AppError.js";
import { MoneyIdempotencyRecordModel } from "../models/index.js";
import {
  MONEY_IDEMPOTENCY_IN_PROGRESS_MESSAGE,
  runMoneyIdempotentMutation,
} from "../services/loyalty/runMoneyIdempotentMutation.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
  await MoneyIdempotencyRecordModel.syncIndexes();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

const actorId = () => new mongoose.Types.ObjectId().toString();

test("claim-first: duplicate key replays stored result without re-execute", async () => {
  let executions = 0;
  const scope = "test_order";
  const actorUserId = actorId();
  const idempotencyKey = "key-replay-1";

  const first = await runMoneyIdempotentMutation({
    scope,
    actorUserId,
    idempotencyKey,
    execute: async () => {
      executions += 1;
      return { orderId: "o1", amount: 10 };
    },
  });

  const second = await runMoneyIdempotentMutation({
    scope,
    actorUserId,
    idempotencyKey,
    execute: async () => {
      executions += 1;
      return { orderId: "o2", amount: 99 };
    },
  });

  assert.equal(executions, 1);
  assert.deepEqual(first, { orderId: "o1", amount: 10 });
  assert.equal(second.duplicate, true);
  assert.equal(second.orderId, "o1");
  assert.equal(second.amount, 10);
});

test("claim-first: concurrent same key — only one execute", async () => {
  let executions = 0;
  const scope = "test_premium";
  const actorUserId = actorId();
  const idempotencyKey = "key-race-1";
  /** @type {((value?: unknown) => void) | null} */
  let releaseFirst = null;

  const gate = new Promise((resolve) => {
    releaseFirst = resolve;
  });

  const slow = runMoneyIdempotentMutation({
    scope,
    actorUserId,
    idempotencyKey,
    execute: async () => {
      executions += 1;
      await gate;
      return { ok: true, n: 1 };
    },
  });

  // Дать первому успеть insert claim
  await new Promise((r) => setTimeout(r, 30));

  let concurrentError = /** @type {unknown} */ (null);
  try {
    await runMoneyIdempotentMutation({
      scope,
      actorUserId,
      idempotencyKey,
      execute: async () => {
        executions += 1;
        return { ok: true, n: 2 };
      },
    });
  } catch (error) {
    concurrentError = error;
  }

  releaseFirst?.();
  const winner = await slow;

  assert.equal(executions, 1);
  assert.deepEqual(winner, { ok: true, n: 1 });
  assert.ok(concurrentError instanceof AppError);
  assert.equal(concurrentError.statusCode, 409);
  assert.equal(concurrentError.message, MONEY_IDEMPOTENCY_IN_PROGRESS_MESSAGE);

  const replay = await runMoneyIdempotentMutation({
    scope,
    actorUserId,
    idempotencyKey,
    execute: async () => {
      executions += 1;
      return { ok: false };
    },
  });
  assert.equal(executions, 1);
  assert.equal(replay.duplicate, true);
  assert.equal(replay.ok, true);
});

test("claim-first: execute failure releases claim for retry", async () => {
  const scope = "test_credit";
  const actorUserId = actorId();
  const idempotencyKey = "key-fail-retry";
  let executions = 0;

  await assert.rejects(
    () =>
      runMoneyIdempotentMutation({
        scope,
        actorUserId,
        idempotencyKey,
        execute: async () => {
          executions += 1;
          throw new Error("SIDE_EFFECT_FAILED");
        },
      }),
    (error) => error instanceof Error && error.message === "SIDE_EFFECT_FAILED",
  );

  const leftover = await MoneyIdempotencyRecordModel.findOne({
    scope,
    actorUserId,
    key: idempotencyKey,
  }).lean();
  assert.equal(leftover, null);

  const recovered = await runMoneyIdempotentMutation({
    scope,
    actorUserId,
    idempotencyKey,
    execute: async () => {
      executions += 1;
      return { credited: 5 };
    },
  });

  assert.equal(executions, 2);
  assert.deepEqual(recovered, { credited: 5 });
});
