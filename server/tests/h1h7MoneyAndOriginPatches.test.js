import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_FIELDS_FOR_ADMIN,
  ALLOWED_FIELDS_FOR_MODERATOR,
} from "../constants/constants.js";
import { parseFrontendOrigins } from "../utils/resolveFrontendOrigin.js";

test("ALLOWED_FIELDS_FOR_MODERATOR excludes absolute userLoyaltyPoints", () => {
  assert.equal(ALLOWED_FIELDS_FOR_MODERATOR.includes("userLoyaltyPoints"), false);
});

test("ALLOWED_FIELDS_FOR_ADMIN allows absolute userLoyaltyPoints for others", () => {
  assert.equal(ALLOWED_FIELDS_FOR_ADMIN.includes("userLoyaltyPoints"), true);
});

test("parseFrontendOrigins strips trailing slash (CSRF/CORS parity)", () => {
  assert.deepEqual(parseFrontendOrigins("https://izibuy.ru/"), ["https://izibuy.ru"]);
});
