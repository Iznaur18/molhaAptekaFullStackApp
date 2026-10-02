import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** @param {Record<string, unknown>} [shipment] */
const makeOrder = (shipment = {}) => ({
  _id: "order-1",
  status: "accepted",
  createdAt: new Date().toISOString(),
  totalAmount: 1000,
  fulfillmentMethod: "delivery",
  paymentMethod: "cardPrepaid",
  prepaidPaidAt: null,
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status: "accepted",
      quantity: 1,
      unitPriceAtOrder: 1000,
      productNameAtOrder: "Товар",
      productId: { _id: "p1", productName: "Товар" },
      itemIndex: 0,
    },
  ],
  shipments: [{ sellerId: SELLER, fulfillmentMethod: "delivery", ...shipment }],
});

describe("кнопка «Оплатить» у покупателя", () => {
  it("показывает сумму и способ — ровно то, что спишут", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({ sellerDeliveryFeeRub: 150 })}
        attentionRole="buyer"
        onPayOrder={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Оплатить 1\s150\s₽ по СБП/ }),
    ).toBeTruthy();
  });

  it("показывает срок оплаты — после него заказ отменится", () => {
    renderWithProviders(
      <OrderCard
        order={{
          ...makeOrder(),
          prepaymentDueAt: new Date(2026, 9, 4, 15, 30).toISOString(),
        }}
        attentionRole="buyer"
        onPayOrder={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Оплатите до 4 октября, 15:30 — иначе заказ отменится"),
    ).toBeTruthy();
  });
});
