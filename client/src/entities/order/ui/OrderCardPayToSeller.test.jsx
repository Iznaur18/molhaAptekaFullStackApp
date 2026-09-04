import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

const makeOrder = ({
  paymentMethod = "cashOnDelivery",
  courierDelivery = false,
  sellerPayoutRequisites = "seller",
  status = "confirmed",
} = {}) => ({
  _id: "order-pay-to",
  status,
  createdAt: new Date().toISOString(),
  totalAmount: 1,
  fulfillmentMethod: "delivery",
  paymentMethod,
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status,
      quantity: 1,
      unitPriceAtOrder: 1,
      productNameAtOrder: "Пакет",
      productId: { _id: "p1", productName: "Пакет" },
      itemIndex: 0,
    },
  ],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      courierDelivery,
      deliveryCarrier: courierDelivery ? "gitorg_courier" : "seller",
      sellerPayoutRequisites,
      deliveryFeeRub: 0,
    },
  ],
});

describe("OrderCard: блок «Перевести продавцу»", () => {
  it("не показывает при наличке и доставке продавцом (даже если в shipment мусор seller)", () => {
    renderWithProviders(
      <OrderCard order={makeOrder()} attentionRole="buyer" compact />,
    );

    expect(
      screen.queryByText(ORDER_CARD_UI.SHIPMENT_PAY_TO("seller")),
    ).toBeNull();
    expect(
      screen.queryByText(ORDER_CARD_UI.SHIPMENT_PAY_TO_HINT),
    ).toBeNull();
  });

  it("показывает только курьер + картой при получении", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          paymentMethod: "cardOnDelivery",
          courierDelivery: true,
          sellerPayoutRequisites: "+7 900 000-00-00",
          status: "in_delivery",
        })}
        attentionRole="buyer"
        compact
      />,
    );

    expect(
      screen.getByText(ORDER_CARD_UI.SHIPMENT_PAY_TO("+7 900 000-00-00")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ORDER_CARD_UI.SHIPMENT_PAY_TO_HINT),
    ).toBeInTheDocument();
  });
});
