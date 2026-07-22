import assert from "node:assert/strict";
import test from "node:test";

import {
  moscowWallTimeToUtc,
  resolveMoscowCalendarMonthUtcRange,
} from "../services/loyalty/moscowCalendarMonth.js";

test("moscowWallTimeToUtc: winter offset UTC+3", () => {
  // 2024-01-15 00:00 MSK = 2024-01-14 21:00 UTC
  const utc = moscowWallTimeToUtc(2024, 1, 15, 0, 0, 0);
  assert.equal(utc.toISOString(), "2024-01-14T21:00:00.000Z");
});

test("resolveMoscowCalendarMonthUtcRange: January 2024", () => {
  const range = resolveMoscowCalendarMonthUtcRange(new Date("2024-01-15T12:00:00.000Z"));
  assert.equal(range.year, 2024);
  assert.equal(range.month, 1);
  assert.equal(range.startUtc.toISOString(), "2023-12-31T21:00:00.000Z");
  assert.equal(range.endUtc.toISOString(), "2024-01-31T21:00:00.000Z");
});
