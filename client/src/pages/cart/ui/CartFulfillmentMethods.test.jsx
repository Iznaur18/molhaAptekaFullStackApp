import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

// Строка товара тянет контекст корзины — для проверки переключателя он не
// нужен, поэтому подменяем её заглушкой.
vi.mock("./CartLineItem.jsx", () => ({ CartLineItem: () => null }));

const { CartFulfillmentSection } = await import("./CartFulfillmentSection.jsx");

const SUMMARY = {
  selectedTotal: 1000,
  selectedListTotal: 1000,
  selectedDiscount: 0,
  selectedPromoDiscount: 0,
  selectedWholesaleDiscount: 0,
  fullTotal: 1000,
  hasPartialSelection: false,
  checkoutBlockReason: null,
  selectedLines: [{ quantity: 1 }],
};

/** @param {{ courierDelivery: boolean }} options */
const renderSection = ({ courierDelivery }) =>
  renderWithProviders(
    <CartFulfillmentSection
      title="Продавец"
      lines={[{ productId: "p1", quantity: 1, product: { productName: "Товар" } }]}
      selectedCount={1}
      areAllSelected
      onToggleAll={vi.fn()}
      isLineSelected={() => true}
      onToggleSelected={vi.fn()}
      onProductClick={vi.fn()}
      summary={SUMMARY}
      canCheckout
      onCheckout={null}
      fulfillmentPicker={{
        value: "delivery",
        pickupAvailable: true,
        deliveryAvailable: true,
        courierDelivery,
        onChange: vi.fn(),
      }}
    />,
  );

describe("способ доставки на чекауте", () => {
  it("курьерский товар: активны курьеры, доставка продавцом недоступна", () => {
    renderSection({ courierDelivery: true });

    const courier = screen.getByRole("button", {
      name: CART_PAGE_UI.SECTION_DELIVERY_COURIER,
    });
    const seller = screen.getByRole("button", {
      name: CART_PAGE_UI.SECTION_DELIVERY_SELLER,
    });

    expect(courier.getAttribute("aria-pressed")).toBe("true");
    expect(courier.disabled).toBe(false);
    expect(seller.disabled).toBe(true);
  });

  it("товар с доставкой продавца: наоборот", () => {
    renderSection({ courierDelivery: false });

    const courier = screen.getByRole("button", {
      name: CART_PAGE_UI.SECTION_DELIVERY_COURIER,
    });
    const seller = screen.getByRole("button", {
      name: CART_PAGE_UI.SECTION_DELIVERY_SELLER,
    });

    expect(seller.getAttribute("aria-pressed")).toBe("true");
    expect(seller.disabled).toBe(false);
    expect(courier.disabled).toBe(true);
  });

  it("недоступный способ объясняет, почему", () => {
    renderSection({ courierDelivery: true });

    expect(
      screen
        .getByRole("button", { name: CART_PAGE_UI.SECTION_DELIVERY_SELLER })
        .getAttribute("title"),
    ).toBe(CART_PAGE_UI.SECTION_METHOD_UNAVAILABLE);
  });
});
