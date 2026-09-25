import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ADDRESS = "г Грозный, ул Субры Кишиевой, д 56";

/** @param {Record<string, any>} [shipmentPatch] */
const makeOrder = (shipmentPatch = {}) => ({
  _id: "order-1",
  status: "accepted",
  createdAt: new Date().toISOString(),
  totalAmount: 1000,
  fulfillmentMethod: "delivery",
  paymentMethod: "cashOnDelivery",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status: "accepted",
      quantity: 1,
      unitPriceAtOrder: 1000,
      productNameAtOrder: "Товар",
      productId: { _id: "p1", productName: "Товар" },
      pickupAddressAtOrder: ADDRESS,
      itemIndex: 0,
    },
  ],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      deliveryCarrier: "lobo",
      ...shipmentPatch,
    },
  ],
});

describe("адрес забора ЛОБО в «Подробностях заказа»", () => {
  it("продавец видит, откуда курьер заберёт, и подсказку до вызова", () => {
    renderWithProviders(<OrderCard order={makeOrder()} attentionRole="seller" />);

    expect(screen.getByText("Курьер заберёт отсюда")).toBeTruthy();
    expect(screen.getByText(ADDRESS)).toBeTruthy();
    expect(screen.getByText(/Поменяйте точку отправления/)).toBeTruthy();
  });

  it("после вызова курьера подсказки о смене адреса нет", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          shippingExternalId: "x:y",
          shippingCarrierStatus: "accepted",
        })}
        attentionRole="seller"
      />,
    );

    expect(screen.getByText(ADDRESS)).toBeTruthy();
    expect(screen.queryByText(/Поменяйте точку отправления/)).toBeNull();
  });

  it("покупателю адрес продавца не показываем", () => {
    renderWithProviders(<OrderCard order={makeOrder()} attentionRole="buyer" />);

    expect(screen.queryByText("Курьер заберёт отсюда")).toBeNull();
  });
});
