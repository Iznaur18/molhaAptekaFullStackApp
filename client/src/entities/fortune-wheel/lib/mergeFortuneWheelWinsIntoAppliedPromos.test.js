import { describe, expect, it } from "vitest";

import { mergeFortuneWheelWinsIntoAppliedPromos } from "./mergeFortuneWheelWinsIntoAppliedPromos.js";

const product = (id, sellerId) => ({
  _id: id,
  productSeller: sellerId ? { _id: sellerId } : null,
});

describe("mergeFortuneWheelWinsIntoAppliedPromos", () => {
  it("без выигрышей возвращает промо как есть", () => {
    const promos = [{ productId: "p1", code: "SALE", discountPercent: 5 }];
    expect(
      mergeFortuneWheelWinsIntoAppliedPromos(promos, [], [product("p1", "s1")]),
    ).toEqual(promos);
  });

  it("добавляет выигрыш на товары своего продавца", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [{ sellerId: "s1", discountPercent: 15 }],
      [product("p1", "s1"), product("p2", "s2")],
    );
    expect(result).toEqual([
      { productId: "p1", code: "FORTUNEWHEEL", discountPercent: 15 },
    ]);
  });

  it("перебивает слабый промо и не трогает более сильный", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [
        { productId: "p1", code: "SALE", discountPercent: 5 },
        { productId: "p2", code: "BIG", discountPercent: 50 },
      ],
      [{ sellerId: "s1", discountPercent: 15 }],
      [product("p1", "s1"), product("p2", "s1")],
    );
    expect(result).toEqual([
      { productId: "p1", code: "FORTUNEWHEEL", discountPercent: 15 },
      { productId: "p2", code: "BIG", discountPercent: 50 },
    ]);
  });

  it("на продавца берётся лучший выигрыш", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [
        { sellerId: "s1", discountPercent: 10 },
        { sellerId: "s1", discountPercent: 30 },
      ],
      [product("p1", "s1")],
    );
    expect(result).toEqual([
      { productId: "p1", code: "FORTUNEWHEEL", discountPercent: 30 },
    ]);
  });

  it("товар без продавца и выигрыш без sellerId игнорируются", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [{ sellerId: "", discountPercent: 10 }],
      [product("p1", null)],
    );
    expect(result).toEqual([]);
  });

  it("выигрыш-товар (prizeProductId) промо-скидку не даёт", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [{ sellerId: "s1", discountPercent: 25, prizeProductId: "p9" }],
      [product("p1", "s1")],
    );
    expect(result).toEqual([]);
  });
});
