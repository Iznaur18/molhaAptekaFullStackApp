import assert from "node:assert/strict";
import { test } from "node:test";

import {
  logMoneyEvent,
  logMoneyFailure,
  resolveMoneyFailureLevel,
} from "../services/loyalty/logMoneyEvent.js";
import { InsufficientLoyaltyPointsError } from "../services/loyalty/loyaltyPointsSpend.js";
import { InsufficientRubBalanceError } from "../services/loyalty/rubBalanceSpend.js";

test("resolveMoneyFailureLevel: insufficient → warn", () => {
  assert.equal(
    resolveMoneyFailureLevel(new InsufficientLoyaltyPointsError(10, 1)),
    "warn",
  );
  assert.equal(
    resolveMoneyFailureLevel(new InsufficientRubBalanceError(100, 0)),
    "warn",
  );
  assert.equal(resolveMoneyFailureLevel(new Error("boom")), "error");
  assert.equal(resolveMoneyFailureLevel({ statusCode: 400, message: "x" }), "warn");
});

test("logMoneyEvent: money.* namespace", () => {
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => {
    lines.push(String(line));
  };
  try {
    logMoneyEvent("info", "loyalty_deduct", {
      userId: "u1",
      amount: 5,
      currency: "LP",
      email: "should-scrub@x.com",
    });
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]);
    assert.equal(parsed.event, "money.loyalty_deduct");
    assert.equal(parsed.userId, "u1");
    assert.equal(parsed.amount, 5);
    assert.equal(parsed.email, "[Filtered]");
  } finally {
    console.log = originalLog;
  }
});

test("logMoneyFailure: appends _failed", () => {
  const lines = [];
  const originalWarn = console.warn;
  console.warn = (line) => {
    lines.push(String(line));
  };
  try {
    logMoneyFailure(
      "loyalty_reserve",
      { userId: "u1", amount: 3, currency: "LP" },
      new InsufficientLoyaltyPointsError(3, 0),
    );
    const parsed = JSON.parse(lines[0]);
    assert.equal(parsed.event, "money.loyalty_reserve_failed");
    assert.equal(parsed.level, "warn");
  } finally {
    console.warn = originalWarn;
  }
});
