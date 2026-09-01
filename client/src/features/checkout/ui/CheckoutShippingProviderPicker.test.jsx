import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { CheckoutShippingProviderPicker } = await import(
  "./CheckoutShippingProviderPicker.jsx"
);

const courierButton = () =>
  screen.getByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_COURIER });
const sellerButton = () =>
  screen.getByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER });

describe("служба доставки в оформлении", () => {
  it("курьерский заказ отмечает курьеров Gitorg", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="courier" />);

    expect(courierButton().getAttribute("aria-checked")).toBe("true");
    expect(sellerButton().getAttribute("aria-checked")).toBe("false");
  });

  it("заказ с доставкой продавца отмечает продавца", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="seller" />);

    expect(sellerButton().getAttribute("aria-checked")).toBe("true");
    expect(courierButton().getAttribute("aria-checked")).toBe("false");
  });

  it("смешанная корзина отмечает обе службы", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="mixed" />);

    expect(courierButton().getAttribute("aria-checked")).toBe("true");
    expect(sellerButton().getAttribute("aria-checked")).toBe("true");
  });
});
