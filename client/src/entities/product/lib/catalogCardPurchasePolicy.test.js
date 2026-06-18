import { describe, expect, it } from "vitest";

import { SHOW_ADD_TO_CART_ON_CATALOG_CARD } from "./catalogCardPurchasePolicy.js";
import { useProductCardChromeFlags } from "../ui/product-card/useProductCardChromeFlags.js";
import { renderHook } from "@testing-library/react";

describe("catalogCardPurchasePolicy", () => {
  it("disables add to cart on catalog cards", () => {
    expect(SHOW_ADD_TO_CART_ON_CATALOG_CARD).toBe(false);
  });

  it("never shows add to cart button on card chrome", () => {
    const { result } = renderHook(() =>
      useProductCardChromeFlags(
        {
          product: {
            _id: "p1",
            productSeller: { _id: "seller-1" },
            productIsAvailable: true,
            catalogPromotionTier: 3,
          },
          highlightCatalogPromotion: true,
          promotionFullWidth: true,
        },
        "buyer-1",
      ),
    );

    expect(result.current.showAddToCartButton).toBe(false);
  });
});
