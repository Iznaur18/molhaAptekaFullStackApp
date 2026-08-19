import { describe, expect, it } from "vitest";

import { selectCartLines } from "./selectCartLines.js";

describe("selectCartLines flash sale", () => {
  const expiredProduct = {
    _id: "p1",
    productPrice: 700,
    productOldPrice: 1000,
    productFlashSaleEnabled: true,
    productFlashSaleEndsAt: "2020-01-01T00:00:00.000Z",
    productFlashSaleBasePrice: 1000,
  };

  it("restores base price when flash sale expired", () => {
    const nowMs = Date.parse("2026-01-01T00:00:00.000Z");
    const { lines, total } = selectCartLines(
      { p1: 2 },
      [expiredProduct],
      {},
      { p1: 700 },
      nowMs,
    );

    expect(lines[0].unitPrice).toBe(1000);
    expect(lines[0].lineTotal).toBe(2000);
    expect(lines[0].product?.productFlashSaleEnabled).toBe(false);
    expect(lines[0].product?.productPrice).toBe(1000);
    expect(lines[0].priceIncreasedSinceAdd).toBe(true);
    expect(total).toBe(2000);
  });

  it("keeps sale price while flash sale active", () => {
    const activeProduct = {
      ...expiredProduct,
      productFlashSaleEndsAt: "2099-01-01T00:00:00.000Z",
    };
    const nowMs = Date.parse("2026-01-01T00:00:00.000Z");
    const { lines } = selectCartLines({ p1: 1 }, [activeProduct], {}, { p1: 700 }, nowMs);

    expect(lines[0].unitPrice).toBe(700);
    expect(lines[0].priceIncreasedSinceAdd).toBe(false);
  });
});
