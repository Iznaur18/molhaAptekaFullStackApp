import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CheckoutPaymentMethodPicker } from "./CheckoutPaymentMethodPicker.jsx";

const titles = () =>
  [...document.querySelectorAll(".checkout-payment-method-picker__title")].map(
    (node) => node.textContent,
  );

describe("выбор способа оплаты", () => {
  it("один доступный способ — строкой, без ряда карточек", () => {
    render(
      <CheckoutPaymentMethodPicker
        value="cardOnDelivery"
        onChange={vi.fn()}
        legend="Способ оплаты"
        allowedMethods={["cardOnDelivery"]}
      />,
    );

    expect(screen.getByRole("note").textContent).toBe("Картой при получении");
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("порядок постоянный: выбор не переставляет, недоступные — в конце", () => {
    const { rerender } = render(
      <CheckoutPaymentMethodPicker
        value="cashOnDelivery"
        onChange={vi.fn()}
        legend="Способ оплаты"
        cardPrepaidAvailable
        allowedMethods={["cashOnDelivery", "cardOnDelivery"]}
      />,
    );
    const before = titles();
    expect(before.at(-1)).toBe("СБП");

    rerender(
      <CheckoutPaymentMethodPicker
        value="cardOnDelivery"
        onChange={vi.fn()}
        legend="Способ оплаты"
        cardPrepaidAvailable
        allowedMethods={["cashOnDelivery", "cardOnDelivery"]}
      />,
    );
    expect(titles()).toEqual(before);
  });

  it("недоступный способ нажать нельзя", () => {
    const onChange = vi.fn();
    render(
      <CheckoutPaymentMethodPicker
        value="cashOnDelivery"
        onChange={onChange}
        legend="Способ оплаты"
        cardPrepaidAvailable
        allowedMethods={["cashOnDelivery", "cardOnDelivery"]}
      />,
    );
    const sbp = screen.getByRole("radio", { name: /СБП/ });
    expect(sbp.hasAttribute("disabled")).toBe(true);
    fireEvent.click(sbp);
    expect(onChange).not.toHaveBeenCalled();
  });
});
