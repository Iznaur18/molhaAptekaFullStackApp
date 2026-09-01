import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** Курьерское отправление покупателя на нужной ступени. */
const makeOrder = (shipmentPatch = {}, status = "ready_to_ship") => ({
  _id: "order-1",
  status,
  createdAt: new Date().toISOString(),
  totalAmount: 1000,
  fulfillmentMethod: "delivery",
  paymentMethod: "cardOnDelivery",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status,
      quantity: 1,
      unitPriceAtOrder: 1000,
      productNameAtOrder: "Товар",
      productId: { _id: "p1", productName: "Товар" },
      itemIndex: 0,
    },
  ],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      courierDelivery: true,
      deliveryFeeRub: 150,
      courierId: null,
      ...shipmentPatch,
    },
  ],
});

describe("сумма курьеру в карточке покупателя", () => {
  it("покупатель может поднять сумму, пока курьер не найден", () => {
    const onRaiseDeliveryFee = vi.fn();
    renderWithProviders(
      <OrderCard
        order={makeOrder()}
        attentionRole="buyer"
        onRaiseDeliveryFee={onRaiseDeliveryFee}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: ORDER_CARD_UI.SHIPMENT_FEE_RAISE }));

    expect(onRaiseDeliveryFee).toHaveBeenCalledWith({
      orderId: "order-1",
      deliveryFeeRub: 175,
    });
  });

  it("после назначения курьера сумма заморожена", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({ courierId: "courier-1" }, "courier_assigned")}
        attentionRole="buyer"
        onRaiseDeliveryFee={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: ORDER_CARD_UI.SHIPMENT_FEE_RAISE }),
    ).toBeNull();
  });

  it("продавцу кнопки нет — платит не он", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder()}
        attentionRole="seller"
        onRaiseDeliveryFee={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: ORDER_CARD_UI.SHIPMENT_FEE_RAISE }),
    ).toBeNull();
  });
});
