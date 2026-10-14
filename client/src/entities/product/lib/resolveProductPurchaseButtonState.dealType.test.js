import { describe, expect, it } from "vitest";

import { resolveProductPurchaseButtonState } from "./resolveProductPurchaseButtonState.js";

const baseProduct = {
  _id: "p1",
  productStockQuantity: 3,
  productIsAvailable: true,
};

describe("resolveProductPurchaseButtonState: тип сделки", () => {
  it("обычный товар и товар без поля показывают «В корзину»", () => {
    const legacy = resolveProductPurchaseButtonState({
      product: baseProduct,
      isOwnProduct: false,
    });
    const goods = resolveProductPurchaseButtonState({
      product: { ...baseProduct, productDealType: "goods" },
      isOwnProduct: false,
    });

    expect(legacy.canShowAddToCart).toBe(true);
    expect(goods.canShowAddToCart).toBe(true);
  });

  it.each(["viewing", "service"])("у «%s» кнопки покупки нет вовсе", (dealType) => {
    const state = resolveProductPurchaseButtonState({
      product: { ...baseProduct, productDealType: dealType },
      isOwnProduct: false,
    });

    expect(state.canShowAddToCart).toBe(false);
    expect(state.hasPurchaseButton).toBe(false);
  });

  it("«Нет в наличии» у объявления без корзины не показывается", () => {
    const state = resolveProductPurchaseButtonState({
      product: { ...baseProduct, productDealType: "viewing", productOutOfStock: true },
      isOwnProduct: false,
    });

    expect(state.showOutOfStockPurchaseButton).toBe(false);
  });

  it("продавец по-прежнему видит «Свой товар»", () => {
    const state = resolveProductPurchaseButtonState({
      product: { ...baseProduct, productDealType: "service" },
      isOwnProduct: true,
    });

    expect(state.showOwnProductPurchaseButton).toBe(true);
  });
});
