import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { CheckoutShippingProviderPicker } =
  await import("./CheckoutShippingProviderPicker.jsx");

const courierButton = () =>
  screen.getByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_COURIER });
const sellerButton = () =>
  screen.getByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER });

/** Плашка «кто везёт» — по полной фразе (визуально она разбита на подпись и имя). */
const badge = (text) => screen.getByRole("note", { name: text });
const queryBadge = (text) => screen.queryByRole("note", { name: text });
describe("служба доставки в оформлении", () => {
  it("служба одна — строка вместо списка: курьеры Gitorg", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="courier" />);

    expect(badge(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_COURIER)).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("служба одна — строка вместо списка: продавец", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="seller" />);

    expect(badge(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_SELLER)).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
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
    const onSelectCarrier = vi.fn();
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery="seller"
        cdekAvailable
        sellerDeliveryAvailable
        onSelectCarrier={onSelectCarrier}
      />,
    );

    const cdek = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
    });
    expect(cdek.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(cdek);
    expect(onSelectCarrier).toHaveBeenLastCalledWith("cdek");

    fireEvent.click(sellerButton());
    expect(onSelectCarrier).toHaveBeenLastCalledWith(null);
  });

  it("нажимаемая служба выделена, недоступная — приглушена", () => {
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery="seller"
        cdekAvailable
        sellerDeliveryAvailable
        onSelectCarrier={vi.fn()}
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
        selectedCarrier="cdek"
        onSelectCarrier={vi.fn()}
      />,
    );

    expect(
      badge(
        CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE(
          CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK,
        ),
      ),
    ).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("СДЭК, Яндекс и своя доставка — три службы, выбранная одна", () => {
    const onSelectCarrier = vi.fn();
    renderWithProviders(
      <CheckoutShippingProviderPicker
        courierDelivery="seller"
        cdekAvailable
        yandexAvailable
        sellerDeliveryAvailable
        selectedCarrier="yandex_delivery"
        onSelectCarrier={onSelectCarrier}
      />,
    );

    const yandex = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_YANDEX,
    });
    expect(yandex.getAttribute("aria-checked")).toBe("true");
    expect(sellerButton().getAttribute("aria-checked")).toBe("false");

    fireEvent.click(
      screen.getByRole("radio", { name: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_CDEK }),
    );
    expect(onSelectCarrier).toHaveBeenLastCalledWith("cdek");
  });

  it("продавец без Яндекса — карточки «Яндекс Доставка — скоро» нет", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="seller" />);

    expect(screen.queryByText(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_YANDEX)).toBeNull();
  });
});

describe("товар с локальной службой", () => {
  const loboButton = () => screen.queryByRole("radio", { name: "ЛОБО" });

  beforeEach(() => {
    // ЛОБО показывается только в своём регионе.
    sessionStorage.setItem("molha.viewerRegionCode", "RU-CE");
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it("товар возит ЛОБО — так и написано, без выбора", () => {
    renderWithProviders(
      <CheckoutShippingProviderPicker courierDelivery="seller" productCarrier="lobo" />,
    );

    expect(badge(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE("ЛОБО"))).toBeTruthy();
    expect(loboButton()).toBeNull();
    expect(queryBadge(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_SELLER)).toBeNull();
  });

  it("без такого товара везёт продавец", () => {
    renderWithProviders(<CheckoutShippingProviderPicker courierDelivery="seller" />);

    expect(badge(CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SINGLE_SELLER)).toBeTruthy();
  });
});
