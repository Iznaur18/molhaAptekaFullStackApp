import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductCardStatusSlot } from "./ProductCardStatusSlot.jsx";

/** @param {Partial<ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>>} overrides */
function buildVm(overrides = {}) {
  return {
    isMineMode: false,
    isModerationQueue: false,
    product: { productIsAvailable: true },
    purchaseLimit: 5,
    isPromotionActive: false,
    isLoyaltyPointsOvercommitted: false,
    getPromotionTierLabel: () => "Золото",
    getPromotionUntil: () => "до 01.01",
    ...overrides,
  };
}

describe("ProductCardStatusSlot", () => {
  it("renders hidden badge for unavailable catalog product", () => {
    render(
      <ProductCardStatusSlot
        vm={buildVm({
          product: { productIsAvailable: false },
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE,
    );
  });

  it("renders promotion badge in mine mode", () => {
    render(
      <ProductCardStatusSlot
        vm={buildVm({
          isMineMode: true,
          isPromotionActive: true,
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Золото");
    expect(screen.getByRole("status")).toHaveTextContent("до 01.01");
  });

  it("renders nothing when no status applies", () => {
    const { container } = render(<ProductCardStatusSlot vm={buildVm()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
