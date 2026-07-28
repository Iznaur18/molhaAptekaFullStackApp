import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseApiSuccess,
  productWriteDataSchema,
} from "../src/index.js";

describe("productWriteDataSchema nullish resilience", () => {
  it("принимает null в optional полях карточки", () => {
    const parsed = parseApiSuccess(
      {
        success: true,
        data: {
          message: "Товар обновлён",
          product: {
            _id: "507f1f77bcf86cd799439011",
            productName: null,
            productPrice: null,
            productModerationStatus: "pending",
            productModerationComment: null,
            productIsAvailable: null,
            soldQuantity: null,
          },
        },
      },
      productWriteDataSchema,
    );
    assert.equal(parsed.product._id, "507f1f77bcf86cd799439011");
    assert.equal(parsed.product.productModerationStatus, "pending");
  });
});
