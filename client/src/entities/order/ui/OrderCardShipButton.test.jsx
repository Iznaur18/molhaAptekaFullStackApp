import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ORDER_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/**
 * Заказ продавца на ступени «Готов к отгрузке» — там живёт кнопка отгрузки.
 *
 * @param {{ method: string; carrier?: string; courierDelivery?: boolean }} shipment
 */
const makeOrder = ({
  method,
  carrier = "",
  courierDelivery = false,
  status = "ready_to_ship",
}) => ({
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

  it("«Оплата получена» только у курьера, не при доставке продавцом", () => {
    const onConfirmPayment = vi.fn();
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "seller",
          status: "delivered",
        })}
        attentionRole="seller"
        onConfirmPayment={onConfirmPayment}
        onCancelItem={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: ORDER_CARD_UI.SHIPMENT_PAYMENT_CONFIRM }),
    ).toBeNull();
  });

  it("«Оплата получена» есть на курьерском in_delivery", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "gitorg_courier",
          courierDelivery: true,
          status: "in_delivery",
        })}
        attentionRole="seller"
        onConfirmPayment={vi.fn()}
        onCancelItem={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: ORDER_CARD_UI.SHIPMENT_PAYMENT_CONFIRM }),
    ).toBeTruthy();
  });
  it("«Отгрузить» стоит в строке отправления, не у позиции", () => {
    const { container } = renderCard(
      makeOrder({ method: "delivery", carrier: "seller", status: "ready_to_ship" }),
    );

    const shipmentRow = container.querySelector(".order-card__shipment-row");
    const itemRow = container.querySelector(".order-card__item-actions-row");
    expect(
      shipmentRow?.querySelector("button")?.textContent,
    ).toContain(ORDER_CARD_UI.ACTION_SHIPPED);
    expect(itemRow?.textContent ?? "").not.toContain(ORDER_CARD_UI.ACTION_SHIPPED);
  });

  it("«Доставлен» стоит в строке отправления после отгрузки", () => {
    const { container } = renderCard(
      makeOrder({ method: "delivery", carrier: "seller", status: "shipped" }),
    );

    const shipmentRow = container.querySelector(".order-card__shipment-row");
    const itemRow = container.querySelector(".order-card__item-actions-row");
    expect(shipmentRow?.textContent ?? "").toContain(ORDER_CARD_UI.ACTION_DELIVERED);
    expect(itemRow?.textContent ?? "").not.toContain(ORDER_CARD_UI.ACTION_DELIVERED);
  });

  it("«Подтвердить» у покупателя в строке отправления", () => {
    const { container } = renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "seller",
          status: "delivered",
        })}
        attentionRole="buyer"
        onConfirmDelivered={vi.fn()}
        onCancelItem={vi.fn()}
      />,
    );

    const shipmentRow = container.querySelector(".order-card__shipment-row");
    const itemRow = container.querySelector(".order-card__item-actions-row");
    expect(shipmentRow?.textContent ?? "").toContain(ORDER_CARD_UI.ACTION_CONFIRM);
    expect(itemRow?.textContent ?? "").not.toContain(ORDER_CARD_UI.ACTION_CONFIRM);
  });

  it("на курьере Gitorg «Подтвердить» у покупателя нет", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "gitorg_courier",
          courierDelivery: true,
          status: "delivered",
        })}
        attentionRole="buyer"
        onConfirmDelivered={vi.fn()}
        onCancelItem={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: ORDER_CARD_UI.ACTION_CONFIRM }),
    ).toBeNull();
    expect(
      screen.getByText(ORDER_CARD_UI.COURIER_CONFIRM_VIA_CODE_HINT),
    ).toBeTruthy();
  });

  it("при поиске курьера Gitorg показывает «Ищем курьера»", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "gitorg_courier",
          courierDelivery: true,
          status: "ready_to_ship",
        })}
        attentionRole="buyer"
        onCancelItem={vi.fn()}
      />,
    );

    expect(screen.getAllByText(ORDER_CARD_UI.AWAITING_COURIER).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(ORDER_CARD_UI.AWAITING_COURIER_BUYER_HINT)).toBeTruthy();
  });

  it("продавцу при поиске курьера — свой текст", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          method: "delivery",
          carrier: "gitorg_courier",
          courierDelivery: true,
          status: "ready_to_ship",
        })}
        attentionRole="seller"
        onCancelItem={vi.fn()}
      />,
    );

    expect(screen.getByText(ORDER_CARD_UI.AWAITING_COURIER_SELLER_HINT)).toBeTruthy();
  });
});

describe("«Отгрузить» — последняя ступень, а не ярлык", () => {
  it("нет на «Принят»: сначала сборка", () => {
    renderCard(makeOrder({ method: "delivery", carrier: "seller", status: "accepted" }));

    expect(shipButton()).toBeNull();
  });

  it("нет на «Собирается»: товар ещё собирают", () => {
    renderCard(
      makeOrder({ method: "delivery", carrier: "seller", status: "assembling" }),
    );

    expect(shipButton()).toBeNull();
  });

  it("появляется на «Готов к отгрузке»", () => {
    renderCard(
      makeOrder({ method: "delivery", carrier: "seller", status: "ready_to_ship" }),
    );

    expect(shipButton()).not.toBeNull();
  });

  it("на ранних ступенях остаётся одно действие вперёд — ступень сборки", () => {
    renderCard(makeOrder({ method: "delivery", carrier: "seller", status: "accepted" }));

    // Ради этого всё и затевалось: два «вперёд» рядом сбивали продавца.
    expect(shipButton()).toBeNull();
    expect(screen.queryByRole("button", { name: ORDER_CARD_UI.ACTION_CANCEL })).not.toBeNull();
  });
});
