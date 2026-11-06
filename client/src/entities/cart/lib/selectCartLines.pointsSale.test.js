import { describe, expect, it } from "vitest";

import { getProductCartQuantityLimit } from "../../product/lib/getProductPurchaseLimit.js";
import { selectCartCheckoutSummary } from "./selectCartCheckoutSummary.js";
import { selectCartLines } from "./selectCartLines.js";

const pointsProduct = {
  _id: "p1",
  productName: "Кружка",
  productPrice: 900,
  productOldPrice: 1200,
  productSeller: { _id: "s1" },
  productIsAvailable: true,
  productPickupAddress: "Грозный, ул. Мира, 7",
  productStockQuantity: 10,
  productPointsSaleEnabled: true,
  productPointsPrice: 300,
  productPointsPerBuyerLimit: 2,
  productWholesaleEnabled: true,
  productWholesaleMinQty: 2,
  productWholesalePrice: 500,
};

describe("товар за баллы в корзине", () => {
  it("рублей в строке нет, сумма — в баллах, промокод и опт не применяются", () => {
    const { lines } = selectCartLines(
      { p1: 2 },
      [pointsProduct],
      [{ productId: "p1", code: "SALE", discountPercent: 50 }],
    );
    const [line] = lines;

    expect(line.isPointsSale).toBe(true);
    expect(line.unitPrice).toBe(0);
    expect(line.lineTotal).toBe(0);
    expect(line.pointsUnitPrice).toBe(300);
    expect(line.pointsLineTotal).toBe(600);
    expect(line.isPromoApplied).toBe(false);
    expect(line.isWholesaleApplied).toBe(false);
  });

  it("итог отмеченных строк считает баллы отдельно от рублей", () => {
    const { lines } = selectCartLines({ p1: 2 }, [pointsProduct]);

    const summary = selectCartCheckoutSummary(lines, "buyer");

    expect(summary.selectedTotal).toBe(0);
    expect(summary.selectedPointsTotal).toBe(600);
  });

  it("лимит в одни руки ограничивает количество, как остаток", () => {
    expect(getProductCartQuantityLimit(pointsProduct)).toBe(2);
    expect(
      getProductCartQuantityLimit({
        ...pointsProduct,
        productPointsPerBuyerLimit: null,
      }),
    ).toBe(10);
    expect(
      getProductCartQuantityLimit({
        ...pointsProduct,
        productPointsSaleEnabled: false,
      }),
    ).toBe(10);
  });
});
