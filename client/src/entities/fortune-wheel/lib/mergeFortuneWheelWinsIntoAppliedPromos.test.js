import { describe, expect, it } from "vitest";

import { mergeFortuneWheelWinsIntoAppliedPromos } from "./mergeFortuneWheelWinsIntoAppliedPromos.js";

const product = (id, sellerId, productPrice = 100) => ({
  _id: id,
  productPrice,
  productSeller: sellerId ? { _id: sellerId } : null,
});

describe("mergeFortuneWheelWinsIntoAppliedPromos", () => {
  it("без выигрышей возвращает промо как есть", () => {
    const promos = [{ productId: "p1", code: "SALE", discountPercent: 5 }];
    expect(
      mergeFortuneWheelWinsIntoAppliedPromos(promos, [], [product("p1", "s1")]),
    ).toEqual(promos);
  });

  it("скидка только на самый дорогой товар продавца", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [{ sellerId: "s1", discountPercent: 15 }],
      [product("p1", "s1", 100), product("p2", "s1", 500), product("p3", "s2", 900)],
    );
    expect(result).toEqual([
      { productId: "p2", code: "FORTUNEWHEEL", discountPercent: 15 },
    ]);
  });

  it("перебивает слабый промо на целевом товаре", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [
        { productId: "p2", code: "SALE", discountPercent: 5 },
        { productId: "p1", code: "BIG", discountPercent: 50 },
      ],
      [{ sellerId: "s1", discountPercent: 15 }],
      [product("p1", "s1", 100), product("p2", "s1", 900)],
    );
    expect(result).toEqual([
      { productId: "p2", code: "FORTUNEWHEEL", discountPercent: 15 },
      { productId: "p1", code: "BIG", discountPercent: 50 },
    ]);
  });

  it("на продавца берётся лучший выигрыш", () => {
    const result = mergeFortuneWheelWinsIntoAppliedPromos(
      [],
      [
        { sellerId: "s1", discountPercent: 10 },
        { sellerId: "s1", discountPercent: 30 },
      ],
      [product("p1", "s1", 200)],
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
      [product("p1", "s1", 100)],
    );
    expect(result).toEqual([]);
  });
});
