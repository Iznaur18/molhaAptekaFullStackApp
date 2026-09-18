import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import mongoose from "mongoose";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { AnalyticsEventModel, UserModel } = await import("../models/index.js");
const {
  emitCartItemsAddedEvents,
  emitPaymentSucceededEvent,
  emitProductPublishedEvent,
  emitSearchPerformedEvent,
  emitUserRegisteredEvent,
  normalizeSearchQueryForAnalytics,
  resetUserActiveDayCache,
  trackUserActiveDay,
} = await import("../services/analytics-events/index.js");

/**
 * События пишутся fire-and-forget — ждём, пока нужное число дойдёт до базы.
 * @param {Record<string, unknown>} filter
 * @param {number} expected
 */
async function waitForEvents(filter, expected) {
  const deadline = Date.now() + 3_000;
  let rows = [];
  while (Date.now() < deadline) {
    rows = await AnalyticsEventModel.find(filter).sort({ occurredAt: 1 }).lean();
    if (rows.length >= expected) {
      // Лишние вставки успели бы прийти — даём им шанс проявиться.
      await new Promise((resolve) => setTimeout(resolve, 50));
      return AnalyticsEventModel.find(filter).sort({ occurredAt: 1 }).lean();
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return rows;
}

const userId = () => new mongoose.Types.ObjectId().toString();

describe("funnel analytics events", () => {
  before(async () => {
    await connectMongoTestReplSet();
  });

  after(async () => {
    await disconnectMongoTestReplSet();
  });

  beforeEach(async () => {
    await clearMongoCollections();
    resetUserActiveDayCache();
  });

  it("user.active: one event per user per UTC day", async () => {
    const id = userId();
    const day1 = new Date("2026-09-17T08:00:00.000Z");
    const later = new Date("2026-09-17T22:00:00.000Z");
    const day2 = new Date("2026-09-18T00:01:00.000Z");

    assert.equal(trackUserActiveDay(id, day1), true);
    assert.equal(trackUserActiveDay(id, later), false);
    assert.equal(trackUserActiveDay(id, day2), true);

    const rows = await waitForEvents({ eventType: "user.active" }, 2);
    assert.deepEqual(
      rows.map((row) => row.payload.day),
      ["2026-09-17", "2026-09-18"],
    );
  });

  it("user.active: a second process does not duplicate the day", async () => {
    const id = userId();
    const now = new Date("2026-09-17T08:00:00.000Z");
    trackUserActiveDay(id, now);
    resetUserActiveDayCache(); // как будто это другой процесс
    trackUserActiveDay(id, now);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const rows = await waitForEvents({ eventType: "user.active" }, 1);
    assert.equal(rows.length, 1);
  });

  it("cart.item_added: the same product counts once a day", async () => {
    const id = userId();
    const productA = new mongoose.Types.ObjectId().toString();
    const productB = new mongoose.Types.ObjectId().toString();
    const now = new Date("2026-09-17T10:00:00.000Z");

    emitCartItemsAddedEvents({
      userId: id,
      productIds: [productA, productB, productA],
      now,
    });
    emitCartItemsAddedEvents({ userId: id, productIds: [productA], now });

    const rows = await waitForEvents({ eventType: "cart.item_added" }, 2);
    assert.equal(rows.length, 2);
    assert.deepEqual(
      new Set(rows.map((row) => row.subjectId)),
      new Set([productA, productB]),
    );
  });

  it("search.performed: normalizes the query and drops phone-like text", async () => {
    emitSearchPerformedEvent({
      userId: null,
      query: "  Детская   КОЛЯСКА ",
      resultCount: 7,
    });
    emitSearchPerformedEvent({ query: "+7 999 123-45-67", resultCount: 0 });

    const rows = await waitForEvents({ eventType: "search.performed" }, 2);
    const byQuery = Object.fromEntries(
      rows.map((row) => [row.payload.query, row.payload]),
    );
    assert.equal(byQuery["детская коляска"].resultCount, 7);
    assert.equal(byQuery["детская коляска"].hasResults, true);
    assert.equal(byQuery[""].hasResults, false);
    assert.equal(byQuery[""].queryLength, "+7 999 123-45-67".length);
  });

  it("payment.succeeded: idempotent per payment", async () => {
    const paymentId = new mongoose.Types.ObjectId().toString();
    const orderId = new mongoose.Types.ObjectId().toString();
    const input = {
      paymentId,
      userId: userId(),
      purpose: "order",
      amountRub: 1500,
      orderId,
    };
    emitPaymentSucceededEvent(input);
    emitPaymentSucceededEvent(input);

    const rows = await waitForEvents({ eventType: "payment.succeeded" }, 1);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].subjectType, "order");
    assert.equal(rows[0].subjectId, orderId);
    assert.equal(rows[0].payload.amountRub, 1500);
  });

  it("seller.product_published: only the first publication is counted", async () => {
    const productId = new mongoose.Types.ObjectId().toString();
    const sellerId = userId();
    emitProductPublishedEvent({ productId, sellerId, autoApproved: true });
    await waitForEvents({ eventType: "seller.product_published" }, 1);
    emitProductPublishedEvent({ productId, sellerId });
    await new Promise((resolve) => setTimeout(resolve, 150));

    const rows = await waitForEvents({ eventType: "seller.product_published" }, 1);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].payload.autoApproved, true);
  });

  it("user.registered carries channel summaries, not the full touch", async () => {
    const id = userId();
    emitUserRegisteredEvent({
      userId: id,
      channel: "phone",
      attribution: {
        firstTouch: {
          source: "vk",
          medium: "post",
          campaign: "2026-10_grozny",
          content: "",
          term: "",
          clickId: "abc",
          referrerHost: "vk.com",
          landingPath: "/",
          capturedAt: "2026-09-17T10:00:00.000Z",
        },
        lastTouch: null,
      },
    });

    const [row] = await waitForEvents({ eventType: "user.registered" }, 1);
    assert.deepEqual(row.payload, {
      channel: "phone",
      firstTouch: { source: "vk", medium: "post", campaign: "2026-10_grozny" },
      lastTouch: null,
    });
  });

  it("UserModel hides marketingAttribution unless selected", async () => {
    const user = await UserModel.create({
      email: "attr@example.com",
      passwordHash: "hash",
      userName: "attr_user",
      marketingAttribution: {
        firstTouch: {
          source: "telegram",
          capturedAt: new Date("2026-09-17T10:00:00Z"),
        },
      },
    });

    const plain = await UserModel.findById(user._id).lean();
    assert.equal(plain.marketingAttribution, undefined);

    const selected = await UserModel.findById(user._id)
      .select("+marketingAttribution")
      .lean();
    assert.equal(selected.marketingAttribution.firstTouch.source, "telegram");
    assert.equal(selected.marketingAttribution.lastTouch, null);
  });
});

describe("normalizeSearchQueryForAnalytics", () => {
  it("keeps ordinary queries and drops emails and long digit runs", () => {
    assert.equal(normalizeSearchQueryForAnalytics("iPhone 15"), "iphone 15");
    assert.equal(normalizeSearchQueryForAnalytics("a@b.ru"), "");
    assert.equal(normalizeSearchQueryForAnalytics("4276 1234 5678"), "");
    assert.equal(normalizeSearchQueryForAnalytics("x".repeat(300)).length, 100);
  });
});
