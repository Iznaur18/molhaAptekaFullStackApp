import assert from "node:assert/strict";
import test from "node:test";

import { ALLOWED_FIELDS_FOR_MODERATOR } from "../constants/constants.js";
import { MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE } from "../services/loyalty/runMoneyIdempotentMutation.js";
import { convertPartnerBalanceToLoyalty } from "../services/referral/convertPartnerBalanceToLoyalty.js";
import { parseFrontendOrigins } from "../utils/resolveFrontendOrigin.js";

test("ALLOWED_FIELDS_FOR_MODERATOR excludes absolute userLoyaltyPoints", () => {
  assert.equal(ALLOWED_FIELDS_FOR_MODERATOR.includes("userLoyaltyPoints"), false);
});

test("parseFrontendOrigins strips trailing slash (CSRF/CORS parity)", () => {
  assert.deepEqual(parseFrontendOrigins("https://izibuy.ru/"), ["https://izibuy.ru"]);
});

test("convertPartnerBalanceToLoyalty requires idempotencyKey", async () => {
  await assert.rejects(
    () =>
      convertPartnerBalanceToLoyalty({
        userId: "aaaaaaaaaaaaaaaaaaaaaaaa",
        amount: 10,
        idempotencyKey: "",
      }),
    (error) =>
      error instanceof Error &&
      error.message === MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE,
  );
});
