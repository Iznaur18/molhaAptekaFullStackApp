import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

const makeOrder = (orderPatch = {}) => ({
  _id: "order-1",
  status: "pending",
  createdAt: new Date().toISOString(),
  totalAmount: 100,
  fulfillmentMethod: "delivery",
  paymentMethod: "cash",
  deliveryAddress: "Грозный, ул. Мира, 1",
  deliveryAddressFlat: "подъезд 2, этаж 5",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status: "pending",
      quantity: 1,
      unitPriceAtOrder: 100,
      productNameAtOrder: "Вода",
      productId: { _id: "p1", productName: "Вода" },
      itemIndex: 0,
    },
  ],
  shipments: [{ sellerId: SELLER, fulfillmentMethod: "delivery" }],
  ...orderPatch,
});

describe("комментарий покупателя в подробностях заказа", () => {
  it("продавец видит комментарий к доставке", () => {
    renderWithProviders(
      <OrderCard order={makeOrder()} attentionRole="seller" showBuyer />,
    );

    expect(screen.getByText(ORDER_CARD_UI.DELIVERY_COMMENT_LABEL)).toBeTruthy();
    expect(screen.getByText("подъезд 2, этаж 5")).toBeTruthy();
  });

  it("пустой комментарий и старый дубль адреса не показываем", () => {
    const { unmount } = renderWithProviders(
      <OrderCard
        order={makeOrder({ deliveryAddressFlat: "" })}
        attentionRole="seller"
      />,
    );
    expect(screen.queryByText(ORDER_CARD_UI.DELIVERY_COMMENT_LABEL)).toBeNull();
    unmount();

    renderWithProviders(
      <OrderCard
        order={makeOrder({ deliveryAddressFlat: "Грозный, ул. Мира, 1" })}
        attentionRole="seller"
      />,
    );
    expect(screen.queryByText(ORDER_CARD_UI.DELIVERY_COMMENT_LABEL)).toBeNull();
  });
});
