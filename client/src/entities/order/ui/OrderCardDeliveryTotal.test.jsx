import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** Заказ с доставкой продавцом: товары на 575 ₽ + 240 ₽ доставки. */
const makeOrder = (itemStatus = "pending") => ({
  _id: "order-1",
  status: itemStatus,
  createdAt: new Date().toISOString(),
  totalAmount: 575,
  fulfillmentMethod: "delivery",
  paymentMethod: "cash",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status: itemStatus,
      quantity: 1,
      unitPriceAtOrder: 575,
      productNameAtOrder: "Вода",
      productId: { _id: "p1", productName: "Вода" },
      itemIndex: 0,
    },
  ],
  shipments: [
    {
      sellerId: SELLER,
      fulfillmentMethod: "delivery",
      courierDelivery: false,
      sellerDeliveryFeeRub: 240,
      deliveryFeeRub: 0,
    },
  ],
});

describe("сумма заказа с доставкой продавцом", () => {
  it("в шапке сумма с доставкой, ниже — доставка и итог", () => {
    renderWithProviders(<OrderCard order={makeOrder()} attentionRole="buyer" />);

    expect(screen.getByText(ORDER_CARD_UI.TOTAL_WITH_DELIVERY_NOTE)).toBeTruthy();
    expect(screen.getByText(ORDER_CARD_UI.SELLER_DELIVERY_FEE_LABEL)).toBeTruthy();
    expect(screen.getByText(ORDER_CARD_UI.TOTAL_WITH_DELIVERY_LABEL)).toBeTruthy();
    const rowValues = [
      ...document.querySelectorAll(".order-card__delivery-total dd"),
    ].map((node) => node.textContent);
    expect(rowValues).toEqual([formatPriceRub(240), formatPriceRub(815)]);
    expect(document.querySelector(".order-card__total")?.textContent).toBe(
      formatPriceRub(815),
    );
  });

  it("все позиции отменены — доставку не прибавляем", () => {
    renderWithProviders(
      <OrderCard order={makeOrder("cancelled")} attentionRole="buyer" />,
    );

    expect(screen.queryByText(ORDER_CARD_UI.TOTAL_WITH_DELIVERY_NOTE)).toBeNull();
    expect(screen.queryByText(ORDER_CARD_UI.TOTAL_WITH_DELIVERY_LABEL)).toBeNull();
  });
});
