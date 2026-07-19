import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isOrderCancelledForPassportShare,
  resolveSellerBuyerPassportShare,
  sanitizeOrderForBuyerApi,
  sanitizeOrderForSellerApi,
} from "../services/order/buyerPassportShare.js";

const SAMPLE_PASSPORT = {
  lastName: "Иванов",
  firstName: "Иван",
  middleName: "Иванович",
  birthDate: new Date("1990-01-15"),
  series: "1234",
  number: "567890",
  issuedBy: "ОВД района",
  issuedAt: new Date("2010-05-20"),
  departmentCode: "770-001",
};

const sampleOrder = (overrides = {}) => ({
  _id: "order1",
  status: "pending",
  items: [{ status: "pending" }],
  passportShareConsentAt: new Date("2026-07-19T10:00:00.000Z"),
  buyerPassportShare: {
    passport: SAMPLE_PASSPORT,
    passportSelfiePhotoUrl: "/uploads/selfie.jpg",
  },
  ...overrides,
});

test("resolveSellerBuyerPassportShare masks series/number and keeps selfie", () => {
  const share = resolveSellerBuyerPassportShare(sampleOrder());
  assert.ok(share);
  assert.equal(share.passport.series, "****");
  assert.equal(share.passport.number, "****7890");
  assert.equal(share.passport.lastName, "Иванов");
  assert.equal(share.passportSelfiePhotoUrl, "/uploads/selfie.jpg");
  assert.ok(share.consentAt);
});

test("resolveSellerBuyerPassportShare returns null when order cancelled", () => {
  assert.equal(
    resolveSellerBuyerPassportShare(sampleOrder({ status: "cancelled" })),
    null,
  );
  assert.equal(
    resolveSellerBuyerPassportShare(
      sampleOrder({ items: [{ status: "cancelled" }] }),
    ),
    null,
  );
});

test("sanitizeOrderForBuyerApi strips passport fields", () => {
  const sanitized = sanitizeOrderForBuyerApi(sampleOrder());
  assert.equal(sanitized.buyerPassportShare, undefined);
  assert.equal(sanitized.passportShareConsentAt, undefined);
});

test("sanitizeOrderForSellerApi exposes masked share", () => {
  const sanitized = sanitizeOrderForSellerApi(sampleOrder());
  assert.equal(sanitized.buyerPassportShare.passport.series, "****");
  assert.ok(sanitized.passportShareConsentAt);
});

test("isOrderCancelledForPassportShare", () => {
  assert.equal(isOrderCancelledForPassportShare(sampleOrder()), false);
  assert.equal(
    isOrderCancelledForPassportShare(sampleOrder({ status: "cancelled" })),
    true,
  );
});
