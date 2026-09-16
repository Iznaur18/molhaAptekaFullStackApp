import { describe, expect, it } from "vitest";

import { SHOW_ADD_TO_CART_ON_CATALOG_CARD } from "./catalogCardPurchasePolicy.js";
import { useProductCardChromeFlags } from "../ui/product-card/useProductCardChromeFlags.js";
import { renderHook } from "@testing-library/react";

const product = {
  _id: "p1",
  productSeller: { _id: "seller-1" },
  productIsAvailable: true,
  productStockQuantity: 5,
  catalogPromotionTier: 3,
};

describe("catalogCardPurchasePolicy", () => {
  it("disables add to cart on catalog cards by default", () => {
    expect(SHOW_ADD_TO_CART_ON_CATALOG_CARD).toBe(false);
  });

  it("does not show add to cart unless the list asks for it", () => {
    const { result } = renderHook(() =>
      useProductCardChromeFlags(
        { product, highlightCatalogPromotion: true, promotionFullWidth: true },
        "buyer-1",
      ),
    );

    expect(result.current.showAddToCartButton).toBe(false);
    expect(result.current.purchaseButtonState).toBeNull();
  });

  it("shows add to cart when the home feed enables it", () => {
    const { result } = renderHook(() =>
      useProductCardChromeFlags({ product, showAddToCart: true }, "buyer-1"),
    );

    expect(result.current.showAddToCartButton).toBe(true);
    expect(result.current.showFooterActions).toBe(true);
    expect(result.current.purchaseButtonState?.showOwnProductPurchaseButton).toBe(
      false,
    );
  });

  it("shows «own product» state instead of add to cart for the seller", () => {
    const { result } = renderHook(() =>
      useProductCardChromeFlags({ product, showAddToCart: true }, "seller-1"),
    );

    expect(result.current.showAddToCartButton).toBe(true);
    expect(result.current.purchaseButtonState?.showOwnProductPurchaseButton).toBe(true);
    expect(result.current.purchaseButtonState?.canShowAddToCart).toBe(false);
  });

  it("shows «out of stock» state for a product without stock", () => {
    const { result } = renderHook(() =>
      useProductCardChromeFlags(
        { product: { ...product, productOutOfStock: true }, showAddToCart: true },
        "buyer-1",
      ),
    );

    expect(result.current.purchaseButtonState?.showOutOfStockPurchaseButton).toBe(true);
    expect(result.current.purchaseButtonState?.canShowAddToCart).toBe(false);
  });
});
