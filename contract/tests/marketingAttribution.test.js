import assert from "node:assert/strict";
import test from "node:test";

import {
  createOrderBodySchema,
  marketingAttributionSchema,
  registerBodySchema,
  registerPhoneBodySchema,
  trackClientAnalyticsBodySchema,
} from "../src/index.js";

const TOUCH = {
  source: "vk",
  medium: "post",
  campaign: "2026-10_grozny",
  capturedAt: "2026-09-17T10:00:00.000Z",
};

test("marketingAttributionSchema: optional, nullable, fills missing touch fields", () => {
  assert.equal(marketingAttributionSchema.parse(undefined), undefined);
  assert.equal(marketingAttributionSchema.parse(null), null);
  const parsed = marketingAttributionSchema.parse({ firstTouch: TOUCH });
  assert.equal(parsed.firstTouch.source, "vk");
  assert.equal(parsed.firstTouch.term, "");
  assert.equal(parsed.lastTouch, null);
});

test("marketingAttributionSchema: rejects oversized values", () => {
  const result = marketingAttributionSchema.safeParse({
    firstTouch: { ...TOUCH, campaign: "x".repeat(101) },
  });
  assert.equal(result.success, false);
});

test("register schemas keep marketingAttribution instead of stripping it", () => {
  const base = {
    password: "secret1",
    passwordConfirm: "secret1",
    userName: "buyer_one",
    marketingAttribution: { firstTouch: TOUCH, lastTouch: TOUCH },
  };
  const email = registerBodySchema.safeParse({ ...base, email: "a@b.ru" });
  assert.equal(email.success, true, JSON.stringify(email.error?.issues));
  assert.equal(email.data.marketingAttribution.lastTouch.source, "vk");

  const phone = registerPhoneBodySchema.safeParse({
    ...base,
    phoneNumber: "+79991234567",
  });
  assert.equal(phone.success, true, JSON.stringify(phone.error?.issues));
  assert.equal(phone.data.marketingAttribution.firstTouch.medium, "post");
});

test("createOrderBodySchema keeps marketingAttribution", () => {
  const result = createOrderBodySchema.safeParse({
    items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
    paymentMethod: "cashOnDelivery",
    idempotencyKey: "k1",
    marketingAttribution: { lastTouch: TOUCH },
  });
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  assert.equal(result.data.marketingAttribution.lastTouch.source, "vk");
});

test("trackClientAnalyticsBodySchema: only known kinds", () => {
  assert.equal(
    trackClientAnalyticsBodySchema.parse({ kind: "checkout.started" }).platform,
    "web",
  );
  assert.equal(
    trackClientAnalyticsBodySchema.safeParse({ kind: "order.created" }).success,
    false,
  );
});
