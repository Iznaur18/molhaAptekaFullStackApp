import { describe, expect, it } from "vitest";

import {
  buildSparklinePaths,
  formatStatsTrendPercentLabel,
} from "./statsTrendSparkline.js";

describe("statsTrendSparkline", () => {
  it("formats percent labels", () => {
    expect(formatStatsTrendPercentLabel(12)).toBe("+12%");
    expect(formatStatsTrendPercentLabel(-5)).toBe("-5%");
    expect(formatStatsTrendPercentLabel(0)).toBe("0%");
  });

  it("builds line and area paths", () => {
    const paths = buildSparklinePaths([1, 2, 4, 3], {
      width: 72,
      height: 28,
      paddingY: 2,
    });
    expect(paths).not.toBeNull();
    expect(paths?.linePath.startsWith("M ")).toBe(true);
    expect(paths?.areaPath.endsWith("Z")).toBe(true);
  });

  it("returns null for short series", () => {
    expect(buildSparklinePaths([1])).toBeNull();
  });
});
