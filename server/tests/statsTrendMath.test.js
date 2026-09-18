import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildStatsTrendSeries,
  computeStatsTrendPercentChange,
  STATS_TREND_BUCKET_COUNT,
} from "../services/user/statsTrendMath.js";

describe("statsTrendMath", () => {
  it("percent: рост от базы", () => {
    assert.equal(computeStatsTrendPercentChange(100, 112), 12);
  });

  it("percent: спад", () => {
    assert.equal(computeStatsTrendPercentChange(100, 88), -12);
  });

  it("percent: с нуля при появлении — 100", () => {
    assert.equal(computeStatsTrendPercentChange(0, 5), 100);
  });

  it("percent: оба нуля — 0", () => {
    assert.equal(computeStatsTrendPercentChange(0, 0), 0);
  });

  it("series: кумулятив за 24 бакета", () => {
    const nowMs = 1_700_000_000_000;
    const windowMs = 24 * 60 * 60 * 1000;
    const windowStart = nowMs - windowMs;
    const eventTimestampsMs = [
      windowStart + 30 * 60 * 1000,
      windowStart + 90 * 60 * 1000,
      windowStart + 90 * 60 * 1000,
    ];

    const result = buildStatsTrendSeries({
      currentTotal: 10,
      eventTimestampsMs,
      nowMs,
      windowMs,
      bucketCount: STATS_TREND_BUCKET_COUNT,
    });

    assert.equal(result.baseTotal, 7);
    assert.equal(result.series.length, 24);
    assert.equal(result.series[0], 8);
    assert.equal(result.series[1], 10);
    assert.equal(result.series[23], 10);
    assert.equal(result.percentChange, 43);
  });
});
