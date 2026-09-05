import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const {
  assertCreateOrderSingleSeller,
  CREATE_ORDER_MULTI_SELLER_MESSAGE,
} = await import("../services/order/assertCreateOrderSingleSeller.js");
const { AppError } = await import("../errors/AppError.js");

const SELLER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const SELLER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("assertCreateOrderSingleSeller", () => {
  it("пропускает один продавец", () => {
    assert.doesNotThrow(() =>
      assertCreateOrderSingleSeller({
        p1: { sellerId: SELLER_A },
        p2: { sellerId: SELLER_A },
      }),
    );
  });

  it("отклоняет несколько продавцов", () => {
    assert.throws(
      () =>
        assertCreateOrderSingleSeller({
          p1: { sellerId: SELLER_A },
          p2: { sellerId: SELLER_B },
        }),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === CREATE_ORDER_MULTI_SELLER_MESSAGE,
    );
  });
});
