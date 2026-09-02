import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/**
 * Заказ продавца на ступени, где товар ещё у него.
 *
 * @param {{ method: string; carrier?: string; courierDelivery?: boolean }} shipment
 */
const makeOrder = ({ method, carrier = "", courierDelivery = false, status = "accepted" }) => ({
  _id: "order-1",
  status,
  createdAt: new Date().toISOString(),
  totalAmount: 1000,
  fulfillmentMethod: method,
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
      fulfillmentMethod: method,
      courierDelivery,
      deliveryCarrier: carrier,
    },
  ],
});

/** @param {any} order */
const renderCard = (order) =>
  renderWithProviders(
    <OrderCard
      order={order}
      attentionRole="seller"
      onMarkShipped={vi.fn()}
      onMarkDelivered={vi.fn()}
      onCancelItem={vi.fn()}
    />,
  );

const shipButton = () =>
  screen.queryByRole("button", { name: ORDER_CARD_UI.ACTION_SHIPPED });

describe("кнопка «Отгрузить»", () => {
  it("есть, когда продавец везёт сам", () => {
    renderCard(makeOrder({ method: "delivery", carrier: "seller" }));

    expect(shipButton()).not.toBeNull();
  });

  it("нет при самовывозе: покупатель придёт на точку", () => {
    renderCard(makeOrder({ method: "pickup" }));

    expect(shipButton()).toBeNull();
  });

  it("нет на курьерском отправлении: отгружает курьер", () => {
    renderCard(
      makeOrder({
        method: "delivery",
        carrier: "gitorg_courier",
        courierDelivery: true,
      }),
    );

    expect(shipButton()).toBeNull();
  });

  it("нет, когда везёт внешняя служба", () => {
    renderCard(makeOrder({ method: "delivery", carrier: "lobo" }));

    expect(shipButton()).toBeNull();
  });

  it("на старом заказе без перевозчика доставка считается продавцовой", () => {
    // Отправления до появления поля: доставка есть, службы нет.
    renderCard(makeOrder({ method: "delivery" }));

    expect(shipButton()).not.toBeNull();
  });

  it("на самовывозе вместо неё «Выдал покупателю»", () => {
    renderCard(makeOrder({ method: "pickup", status: "ready_for_pickup" }));

    expect(shipButton()).toBeNull();
    expect(
      screen.getByRole("button", { name: ORDER_CARD_UI.ACTION_HANDED_TO_BUYER }),
    ).toBeTruthy();
  });

  it("у доставки на той же ступени выдачи нет — товар ещё повезут", () => {
    renderCard(
      makeOrder({ method: "delivery", carrier: "seller", status: "ready_to_ship" }),
    );

    expect(
      screen.queryByRole("button", { name: ORDER_CARD_UI.ACTION_HANDED_TO_BUYER }),
    ).toBeNull();
  });

  it("«Отменить» остаётся везде: отменить можно любое отправление", () => {
    renderCard(makeOrder({ method: "pickup" }));

    expect(
      screen.getByRole("button", { name: ORDER_CARD_UI.ACTION_CANCEL }),
    ).toBeTruthy();
  });
});
