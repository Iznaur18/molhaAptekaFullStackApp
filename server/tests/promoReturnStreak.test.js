import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  applyPromoReturnStreakDiscount,
  getMoscowCalendarDateString,
  getPreviousMoscowCalendarDateString,
  resolvePromoReturnStreakState,
} = await import("../services/promo-return-streak/promoReturnStreak.js");

describe("promo return streak pricing", () => {
  it("день 7 → −95%, минимум 1", () => {
    assert.equal(applyPromoReturnStreakDiscount(100, 95), 5);
    assert.equal(applyPromoReturnStreakDiscount(1, 95), 1);
  });

  it("без % — list price", () => {
    assert.equal(applyPromoReturnStreakDiscount(7000, 0), 7000);
  });
});

describe("resolvePromoReturnStreakState", () => {
  const now = new Date("2026-09-09T12:00:00+03:00");
  const today = getMoscowCalendarDateString(now);
  const yesterday = getPreviousMoscowCalendarDateString(today);

  it("можно забрать день 1, если никогда не забирали", () => {
    const state = resolvePromoReturnStreakState({}, now);
    assert.equal(state.canClaim, true);
    assert.equal(state.nextClaimDay, 1);
    assert.equal(state.displayDiscountPercent, 5);
    assert.equal(state.discountPercent, 0);
  });

  it("после claim сегодня — скидка активна, повторный claim закрыт", () => {
    const state = resolvePromoReturnStreakState(
      {
        promoReturnStreakDay: 3,
        promoReturnStreakLastClaimDate: today,
      },
      now,
    );
    assert.equal(state.canClaim, false);
    assert.equal(state.claimedToday, true);
    assert.equal(state.day, 3);
    assert.equal(state.discountPercent, 20);
  });

  it("после сжигания (day=0, lastClaim=today) — claim закрыт", () => {
    const state = resolvePromoReturnStreakState(
      {
        promoReturnStreakDay: 0,
        promoReturnStreakLastClaimDate: today,
      },
      now,
    );
    assert.equal(state.canClaim, false);
    assert.equal(state.claimedToday, true);
    assert.equal(state.discountPercent, 0);
  });

  it("вчера day=3 → сегодня claim day=4", () => {
    const state = resolvePromoReturnStreakState(
      {
        promoReturnStreakDay: 3,
        promoReturnStreakLastClaimDate: yesterday,
      },
      now,
    );
    assert.equal(state.canClaim, true);
    assert.equal(state.nextClaimDay, 4);
    assert.equal(state.displayDiscountPercent, 30);
  });

  it("пропуск дня → сброс на день 1", () => {
    const state = resolvePromoReturnStreakState(
      {
        promoReturnStreakDay: 5,
        promoReturnStreakLastClaimDate: "2026-09-01",
      },
      now,
    );
    assert.equal(state.canClaim, true);
    assert.equal(state.nextClaimDay, 1);
  });

  it("утро после дня 7 → снова день 1", () => {
    const state = resolvePromoReturnStreakState(
      {
        promoReturnStreakDay: 7,
        promoReturnStreakLastClaimDate: yesterday,
      },
      now,
    );
    assert.equal(state.canClaim, true);
    assert.equal(state.nextClaimDay, 1);
    assert.equal(state.displayDiscountPercent, 5);
  });
});
