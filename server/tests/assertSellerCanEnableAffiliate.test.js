import assert from "node:assert/strict";
import test from "node:test";

import { AppError } from "../errors/AppError.js";
import { assertSellerCanEnableAffiliate } from "../services/product/assertSellerCanEnableAffiliate.js";
import { UserModel } from "../models/index.js";

test("assertSellerCanEnableAffiliate: skips when required payout is 0", async () => {
  await assert.doesNotReject(() =>
    assertSellerCanEnableAffiliate({
      sellerId: "aaaaaaaaaaaaaaaaaaaaaaaa",
      productPrice: 50,
      affiliatePercent: 1,
    }),
  );
});

test("assertSellerCanEnableAffiliate: 400 when free points < required", async () => {
  const original = UserModel.findById;
  UserModel.findById = () => ({
    select() {
      return {
        lean: async () => ({
          userLoyaltyPoints: 40,
          userLoyaltyPointsReserved: 10,
        }),
      };
    },
  });

  try {
    await assert.rejects(
      () =>
        assertSellerCanEnableAffiliate({
          sellerId: "bbbbbbbbbbbbbbbbbbbbbbbb",
          productPrice: 1000,
          affiliatePercent: 10,
        }),
      (error) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message ===
          "Недостаточно баллов для партнёрки. Нужно 100, свободно 30. Пополните баллы.",
    );
  } finally {
    UserModel.findById = original;
  }
});

test("assertSellerCanEnableAffiliate: passes when free points enough", async () => {
  const original = UserModel.findById;
  UserModel.findById = () => ({
    select() {
      return {
        lean: async () => ({
          userLoyaltyPoints: 200,
          userLoyaltyPointsReserved: 50,
        }),
      };
    },
  });

  try {
    await assert.doesNotReject(() =>
      assertSellerCanEnableAffiliate({
        sellerId: "cccccccccccccccccccccccc",
        productPrice: 1000,
        affiliatePercent: 10,
      }),
    );
  } finally {
    UserModel.findById = original;
  }
});
