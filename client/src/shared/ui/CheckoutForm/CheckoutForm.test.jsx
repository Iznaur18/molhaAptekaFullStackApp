import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { CHECKOUT_FORM_UI } from "../../config/appUiCopy.js";
import { CheckoutForm } from "./CheckoutForm.jsx";

vi.mock("../../../shared/config/featureFlags.js", () => ({
  IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED: false,
}));

const baseProps = {
  defaultDeliveryAddress: {},
  isSubmitting: false,
  submitError: "",
  submitSuccess: "",
  onSubmit: vi.fn(),
};

describe("CheckoutForm", () => {
  it("disables submit until address is filled", () => {
    renderWithProviders(<CheckoutForm {...baseProps} />);

    expect(screen.getByRole("button", { name: CHECKOUT_FORM_UI.SUBMIT_IDLE })).toBeDisabled();
  });

  it("shows validation error on empty submit", async () => {
    renderWithProviders(<CheckoutForm {...baseProps} />);

    const form = screen.getByRole("heading", { name: CHECKOUT_FORM_UI.HEADING }).closest("form");
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent("Укажите адрес доставки");
  });

  it("submits trimmed address when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <CheckoutForm
        {...baseProps}
        onSubmit={onSubmit}
        defaultDeliveryAddress={{
          userAddress: "г Москва, ул Ленина, д 1",
          userAddressFiasId: "fias-1",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: CHECKOUT_FORM_UI.SUBMIT_IDLE }));

    expect(onSubmit).toHaveBeenCalledWith({
      deliveryAddress: "г Москва, ул Ленина, д 1",
      deliveryAddressFlat: "",
      paymentMethod: "cardPrepaid",
    });
  });

  it("shows submit error and success messages", () => {
    const { rerender } = renderWithProviders(
      <CheckoutForm {...baseProps} submitError="Ошибка оплаты" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Ошибка оплаты");

    rerender(
      <CheckoutForm {...baseProps} submitSuccess={CHECKOUT_FORM_UI.SUCCESS} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(CHECKOUT_FORM_UI.SUCCESS);
  });
});
