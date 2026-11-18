import { describe, expect, it } from "vitest";

import { resolveMobileBottomNavShiftY } from "./resolveMobileBottomNavShiftY.js";

const aligned = {
  currentShiftY: 0,
  rectBottom: 786,
  rectHeight: 58,
  layoutGapPx: 14,
  visualOffsetTop: 0,
  visualHeight: 800,
};

describe("resolveMobileBottomNavShiftY", () => {
  it("leaves the bar when it already sits on the visual bottom", () => {
    expect(resolveMobileBottomNavShiftY(aligned)).toBe(0);
  });

  it("drops a bar that stuck above the visual bottom", () => {
    expect(resolveMobileBottomNavShiftY({ ...aligned, rectBottom: 700 })).toBe(86);
  });

  it("keeps an already applied shift", () => {
    expect(
      resolveMobileBottomNavShiftY({
        ...aligned,
        currentShiftY: 86,
        rectBottom: 786,
      }),
    ).toBe(86);
  });

  it("lifts the bar when the visual viewport shrinks under it", () => {
    expect(
      resolveMobileBottomNavShiftY({
        ...aligned,
        visualHeight: 420,
        rectBottom: 786,
      }),
    ).toBe(-380);
  });

  it("follows a scrolled visual viewport", () => {
    expect(
      resolveMobileBottomNavShiftY({
        ...aligned,
        visualOffsetTop: 100,
        visualHeight: 700,
        rectBottom: 786,
      }),
    ).toBe(0);
  });

  it("resets when the bar is hidden", () => {
    expect(resolveMobileBottomNavShiftY({ ...aligned, rectHeight: 0 })).toBe(0);
  });

  it("ignores a measurement larger than the viewport", () => {
    expect(
      resolveMobileBottomNavShiftY({
        ...aligned,
        currentShiftY: 12,
        rectBottom: 4000,
      }),
    ).toBe(12);
  });
});
