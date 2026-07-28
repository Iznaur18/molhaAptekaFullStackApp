import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { CHECKOUT_FORM_UI } from "../../config/appUiCopy.js";
import { ORDER_PAYMENT_METHOD_DEFAULT } from "../../../entities/order/model/constants.js";
import { CheckoutForm } from "./CheckoutForm.jsx";

vi.mock("../../../shared/config/featureFlags.js", () => ({
  IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED: false,
}));

const baseProps = {
  defaultDeliveryAddress: {},
  pickupAddressSummary: "Москва, Тверская 1",
  isSubmitting: false,
  submitError: "",
  submitSuccess: "",
  onSubmit: vi.fn(),
};

describe("CheckoutForm", () => {
  it("disables submit when pickup address missing", () => {
    renderWithProviders(<CheckoutForm {...baseProps} pickupAddressSummary="" />);

    expect(screen.getByRole("button", { name: CHECKOUT_FORM_UI.SUBMIT_IDLE })).toBeDisabled();
  });

  it("shows pickup validation error on empty pickup submit", async () => {
    renderWithProviders(<CheckoutForm {...baseProps} pickupAddressSummary="" />);

    const form = screen.getByRole("heading", { name: CHECKOUT_FORM_UI.HEADING }).closest("form");
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED,
    );
  });

  it("submits pickup fulfillment when address present", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<CheckoutForm {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: CHECKOUT_FORM_UI.SUBMIT_IDLE }));

    expect(onSubmit).toHaveBeenCalledWith({
      fulfillmentMethod: "pickup",
      deliveryAddress: "",
      deliveryAddressFlat: "",
      paymentMethod: ORDER_PAYMENT_METHOD_DEFAULT,
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
