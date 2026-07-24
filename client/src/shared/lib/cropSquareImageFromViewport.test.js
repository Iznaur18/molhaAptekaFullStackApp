import { describe, expect, it } from "vitest";

import {
  computeCoverScale,
  computeMaxPanOffset,
  computeSquareCropFromViewport,
} from "./cropSquareImageFromViewport.js";

describe("cropSquareImageFromViewport", () => {
  it("cover scale uses the larger side ratio", () => {
    expect(computeCoverScale(2000, 1000, 280)).toBeCloseTo(0.28);
    expect(computeCoverScale(1000, 2000, 280)).toBeCloseTo(0.28);
  });

  it("centered crop at zoom 1 covers the short side", () => {
    const crop = computeSquareCropFromViewport({
      imageWidth: 2000,
      imageHeight: 1000,
      frameSize: 280,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    expect(crop.size).toBeCloseTo(1000);
    expect(crop.sy).toBeCloseTo(0);
    expect(crop.sx).toBeCloseTo(500);
  });

  it("pan offsets stay within cover bounds", () => {
    const { maxX, maxY } = computeMaxPanOffset(2000, 1000, 280, 1);
    expect(maxX).toBeGreaterThan(0);
    expect(maxY).toBe(0);
  });
});
