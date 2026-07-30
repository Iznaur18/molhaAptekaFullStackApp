import { describe, expect, it } from "vitest";

import { selectCartLines } from "./selectCartLines.js";

describe("selectCartLines wholesale", () => {
  it("applies wholesale unit price when qty meets threshold", () => {
    const { lines, total } = selectCartLines(
      { p1: 5 },
      [
        {
          _id: "p1",
          productPrice: 1000,
          productWholesaleEnabled: true,
          productWholesaleMinQty: 5,
          productWholesalePrice: 800,
        },
      ],
    );
    expect(lines[0].lineTotal).toBe(4000);
    expect(lines[0].unitPrice).toBe(800);
    expect(lines[0].isWholesaleApplied).toBe(true);
    expect(lines[0].wholesaleSavings).toBe(1000);
    expect(total).toBe(4000);
  });

  it("keeps retail when qty below threshold", () => {
    const { lines } = selectCartLines(
      { p1: 4 },
      [
        {
          _id: "p1",
          productPrice: 1000,
          productWholesaleEnabled: true,
          productWholesaleMinQty: 5,
          productWholesalePrice: 800,
        },
      ],
    );
    expect(lines[0].lineTotal).toBe(4000);
    expect(lines[0].isWholesaleApplied).toBe(false);
    expect(lines[0].wholesaleSavings).toBe(0);
  });
});
