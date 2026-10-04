import assert from "node:assert/strict";
import test, { mock } from "node:test";

import { buildSellerQrPath, trackSellerQrScanBodySchema } from "@molha/api-contract";

import { ANALYTICS_EVENT_SELLER_QR_SCANNED } from "../constants/analyticsEventConstants.js";
import { AnalyticsEventModel } from "../models/index.js";
import { emitSellerQrScannedEvent } from "../services/analytics-events/index.js";

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";
const BUYER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const NOW = new Date("2026-10-04T10:00:00.000Z");

/** @returns {{ docs: any[]; restore: () => void }} */
function captureInserts() {
  const docs = [];
  const createMock = mock.method(AnalyticsEventModel, "create", async (doc) => {
    docs.push(Array.isArray(doc) ? doc[0] : doc);
    return doc;
  });
  return { docs, restore: () => createMock.mock.restore() };
}

test("гость по QR: событие с ключом на посетителя и день", async () => {
  const capture = captureInserts();
  try {
    const queued = emitSellerQrScannedEvent({
      sellerId: SELLER,
      visitorId: "visitor-12345",
      now: NOW,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(queued, true);
    assert.equal(capture.docs.length, 1);
    assert.equal(capture.docs[0].eventType, ANALYTICS_EVENT_SELLER_QR_SCANNED);
    assert.equal(capture.docs[0].subjectId, SELLER);
    assert.equal(
      capture.docs[0].idempotencyKey,
      `seller.qr_scanned:${SELLER}:v:visitor-12345:2026-10-04`,
    );
  } finally {
    capture.restore();
  }
});

test("вошедший по QR: считается по аккаунту, а не по браузеру", async () => {
  const capture = captureInserts();
  try {
    emitSellerQrScannedEvent({
      sellerId: SELLER,
      visitorId: "visitor-12345",
      actorUserId: BUYER,
      now: NOW,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(
      capture.docs[0].idempotencyKey,
      `seller.qr_scanned:${SELLER}:u:${BUYER}:2026-10-04`,
    );
  } finally {
    capture.restore();
  }
});

test("продавец открыл свой же QR — не считаем", async () => {
  const capture = captureInserts();
  try {
    const queued = emitSellerQrScannedEvent({
      sellerId: SELLER,
      visitorId: "visitor-12345",
      actorUserId: SELLER,
      now: NOW,
    });
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(queued, false);
    assert.equal(capture.docs.length, 0);
  } finally {
    capture.restore();
  }
});

test("QR ведёт на постоянный адрес витрины с меткой", () => {
  assert.equal(buildSellerQrPath(SELLER), `/seller/${SELLER}?src=qr`);
});

test("тело трека: нужен id продавца и id посетителя без мусора", () => {
  assert.equal(
    trackSellerQrScanBodySchema.safeParse({
      sellerId: SELLER,
      visitorId: "abcDEF_12-3",
    }).success,
    true,
  );
  assert.equal(
    trackSellerQrScanBodySchema.safeParse({
      sellerId: "nope",
      visitorId: "abcDEF_12-3",
    }).success,
    false,
  );
  assert.equal(
    trackSellerQrScanBodySchema.safeParse({ sellerId: SELLER, visitorId: "a b" })
      .success,
    false,
  );
});
