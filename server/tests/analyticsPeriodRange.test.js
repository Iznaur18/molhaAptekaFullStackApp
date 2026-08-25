import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ADMIN_ANALYTICS_PERIOD_7D,
  ADMIN_ANALYTICS_PERIOD_30D,
  ADMIN_ANALYTICS_PERIOD_ALL,
  ADMIN_ANALYTICS_PERIOD_TODAY,
} from "../constants/analyticsConstants.js";
import {
  buildCreatedAtPeriodMatch,
  resolveAnalyticsPeriodRange,
} from "../services/analytics/resolveAnalyticsPeriodRange.js";

test("resolveAnalyticsPeriodRange: today starts at UTC midnight", () => {
  const asOf = new Date("2026-08-25T15:30:00.000Z");
  const range = resolveAnalyticsPeriodRange(ADMIN_ANALYTICS_PERIOD_TODAY, asOf);
  assert.equal(range.key, ADMIN_ANALYTICS_PERIOD_TODAY);
  assert.equal(range.from?.toISOString(), "2026-08-25T00:00:00.000Z");
  assert.equal(range.to.toISOString(), asOf.toISOString());
});

test("resolveAnalyticsPeriodRange: 7d / 30d / all", () => {
  const asOf = new Date("2026-08-25T12:00:00.000Z");
  const week = resolveAnalyticsPeriodRange(ADMIN_ANALYTICS_PERIOD_7D, asOf);
  assert.equal(
    week.from?.toISOString(),
    new Date(asOf.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  );

  const month = resolveAnalyticsPeriodRange(ADMIN_ANALYTICS_PERIOD_30D, asOf);
  assert.equal(
    month.from?.toISOString(),
    new Date(asOf.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  );

  const all = resolveAnalyticsPeriodRange(ADMIN_ANALYTICS_PERIOD_ALL, asOf);
  assert.equal(all.from, null);
});

test("buildCreatedAtPeriodMatch: with and without from", () => {
  const to = new Date("2026-08-25T00:00:00.000Z");
  const from = new Date("2026-08-01T00:00:00.000Z");
  assert.deepEqual(buildCreatedAtPeriodMatch(null, to), {
    createdAt: { $lte: to },
  });
  assert.deepEqual(buildCreatedAtPeriodMatch(from, to), {
    createdAt: { $gte: from, $lte: to },
  });
});
