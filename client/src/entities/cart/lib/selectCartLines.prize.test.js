import { describe, expect, it } from "vitest";

import { selectCartLines } from "./selectCartLines.js";

const product = { _id: "p1", productPrice: 1000 };

describe("selectCartLines prizeFreeUnits", () => {
  it("призовая единица вычитается из суммы строки", () => {
    const { lines, total } = selectCartLines(
      { p1: 2 },
      [product],
      {},
      {},
      Date.now(),
      {},
      { p1: 1 },
    );
    expect(lines[0].prizeFreeUnits).toBe(1);
    expect(lines[0].lineTotal).toBe(1000);
    expect(total).toBe(1000);
  });

  it("призовые единицы не превышают количество в строке", () => {
    const { lines } = selectCartLines(
      { p1: 1 },
      [product],
      {},
      {},
      Date.now(),
      {},
      { p1: 3 },
    );
    expect(lines[0].prizeFreeUnits).toBe(1);
    expect(lines[0].lineTotal).toBe(0);
  });

  it("без призов строка считается как раньше", () => {
    const { lines, total } = selectCartLines({ p1: 2 }, [product]);
    expect(lines[0].prizeFreeUnits).toBe(0);
    expect(lines[0].lineTotal).toBe(2000);
    expect(total).toBe(2000);
  });
});
