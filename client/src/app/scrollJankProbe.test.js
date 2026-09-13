import { expect, test } from "vitest";

import { summarizeFrameIntervals } from "./scrollJankProbe.js";

test("сводка кадров: перцентили и число долгих кадров", () => {
  const intervals = [...Array.from({ length: 18 }, () => 16.7), 40, 120];

  expect(summarizeFrameIntervals(intervals)).toEqual({
    frames: 20,
    durationMs: 461,
    p50: 17,
    p95: 120,
    max: 120,
    longFrames: 2,
    veryLongFrames: 1,
  });
});

test("пустая сводка", () => {
  expect(summarizeFrameIntervals([])).toBeNull();
});
