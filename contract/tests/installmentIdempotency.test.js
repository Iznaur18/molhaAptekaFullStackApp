import assert from "node:assert/strict";
import test from "node:test";

import {
  INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH,
  installmentIdempotencyBodySchema,
} from "../src/installment.js";

test("installmentIdempotencyBodySchema: empty / undefined → {}", () => {
  assert.deepEqual(installmentIdempotencyBodySchema.parse(undefined), {});
  assert.deepEqual(installmentIdempotencyBodySchema.parse({}), {});
});

test("installmentIdempotencyBodySchema: accepts idempotencyKey", () => {
  assert.deepEqual(
    installmentIdempotencyBodySchema.parse({
      idempotencyKey: "client-key-1",
    }),
    { idempotencyKey: "client-key-1" },
  );
});

test("installmentIdempotencyBodySchema: rejects oversized key", () => {
  assert.throws(() =>
    installmentIdempotencyBodySchema.parse({
      idempotencyKey: "x".repeat(INSTALLMENT_IDEMPOTENCY_KEY_MAX_LENGTH + 1),
    }),
  );
});
