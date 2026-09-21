import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { CheckoutShippingProviderPicker } =
  await import("./CheckoutShippingProviderPicker.jsx");

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

  it("СДЭК не показываем, пока продавец его не разрешил", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="seller" />);

    expect(
      screen.queryByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK }),
    ).toBeNull();
  });

  it("две службы у продавца — покупатель переключается между ними", () => {
    const onSelectCdek = vi.fn();
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery="seller"
        cdekAvailable
        sellerDeliveryAvailable
        onSelectCdek={onSelectCdek}
      />,
    );

    const cdek = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
    });
    expect(cdek.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(cdek);
    expect(onSelectCdek).toHaveBeenLastCalledWith(true);

    fireEvent.click(sellerButton());
    expect(onSelectCdek).toHaveBeenLastCalledWith(false);
  });

  it("нажимаемая служба выделена, недоступная — приглушена", () => {
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery="seller"
        cdekAvailable
        sellerDeliveryAvailable
        onSelectCdek={vi.fn()}
      />,
    );

    const cdek = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
    });
    expect(cdek.className).toContain(
      "checkout-shipping-provider-picker__card--selectable",
    );
    expect(courierButton().className).toContain(
      "checkout-shipping-provider-picker__card--static",
    );
    expect(sellerButton().className).not.toContain("--static");
  });

  it("у продавца только СДЭК — он выбран и переключать нечего", () => {
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery={null}
        cdekAvailable
        sellerDeliveryAvailable={false}
        cdekSelected
        onSelectCdek={vi.fn()}
      />,
    );

    const cdek = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
    });
    expect(cdek.getAttribute("aria-checked")).toBe("true");
    expect(cdek.disabled).toBe(true);
  });
});
