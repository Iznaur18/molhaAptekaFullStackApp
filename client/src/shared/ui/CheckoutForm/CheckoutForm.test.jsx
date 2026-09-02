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

const singlePickupGroup = [
  {
    productId: "p1",
    productTitle: "Товар",
    locations: [
      {
        id: "legacy-default",
        label: "",
        address: "Москва, Тверская 1",
        lat: 55.75,
        lon: 37.62,
        isDefault: true,
      },
    ],
  },
];

const baseProps = {
  defaultDeliveryAddress: {},
  pickupLocations: singlePickupGroup,
  isSubmitting: false,
  submitError: "",
  submitSuccess: "",
  onSubmit: vi.fn(),
};

describe("CheckoutForm", () => {
  it("disables submit when pickup address missing", () => {
    renderWithProviders(<CheckoutForm {...baseProps} pickupLocations={[]} />);

    expect(screen.getByRole("button", { name: CHECKOUT_FORM_UI.SUBMIT_IDLE })).toBeDisabled();
  });

  it("shows pickup validation error on empty pickup submit", async () => {
    renderWithProviders(<CheckoutForm {...baseProps} pickupLocations={[]} />);

    const form = screen.getByRole("heading", { name: CHECKOUT_FORM_UI.HEADING }).closest("form");
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED,
    );
  });

  it("renders pickup points per product", () => {
    renderWithProviders(
      <CheckoutForm
        {...baseProps}
        pickupLocations={[
          {
            productId: "p1",
            productTitle: "Аспирин",
            locations: [
              {
                id: "a",
                address: "Москва, Тверская 1",
                lat: 1,
                lon: 2,
                isDefault: true,
              },
            ],
          },
          {
            productId: "p2",
            productTitle: "Витамин C",
            locations: [
              {
                id: "b",
                address: "Грозный, ул. Кишиевой 56",
                lat: 3,
                lon: 4,
                isDefault: true,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Москва, Тверская 1")).toBeInTheDocument();
    expect(screen.getByText("Грозный, ул. Кишиевой 56")).toBeInTheDocument();
    expect(screen.getByText("Аспирин")).toBeInTheDocument();
    expect(screen.getByText("Витамин C")).toBeInTheDocument();
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
      // Самовывоз координат не требует: везти некому.
      deliveryAddressGeo: null,
      paymentMethod: ORDER_PAYMENT_METHOD_DEFAULT,
      pickupSelections: [{ productId: "p1", pickupLocationId: "legacy-default" }],
    });
  });

  it("shows delivery hint on click when cart products do not support it", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CheckoutForm {...baseProps} />);

    expect(container.querySelector(".checkout-form__soon")).toBeNull();
    const deliveryChip = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY,
    });
    expect(deliveryChip).toHaveAttribute("aria-disabled", "true");
    await user.click(deliveryChip);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
    );
  });

  it("enables delivery chip when deliveryAvailable", () => {
    renderWithProviders(<CheckoutForm {...baseProps} deliveryAvailable />);

    expect(
      screen.getByRole("radio", { name: CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY }),
    ).toHaveAttribute("aria-disabled", "false");
  });

  it("switches to delivery chip layout like mobile", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutForm {...baseProps} deliveryAvailable />);

    const deliveryChip = screen.getByRole("radio", {
      name: CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY,
    });
    await user.click(deliveryChip);

    expect(deliveryChip).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: CHECKOUT_FORM_UI.FULFILLMENT_PICKUP }),
    ).toHaveAttribute("aria-checked", "false");
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
