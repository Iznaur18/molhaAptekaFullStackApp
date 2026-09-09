import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  FORMAT_BOOLEAN_RU,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { SHIPMENT_ADVANCE_BUTTON_LABEL_RU } from "../model/constants.js";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ORDER_ID = "order-1";

/** @param {string[]} statuses */
const makeOrder = (statuses) => ({
  _id: ORDER_ID,
  status: statuses[0],
  createdAt: new Date().toISOString(),
  totalAmount: 1000 * statuses.length,
  fulfillmentMethod: "delivery",
  paymentMethod: "cardOnDelivery",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: statuses.map((status, itemIndex) => ({
    sellerIdAtOrder: SELLER,
    status,
    quantity: 1,
    unitPriceAtOrder: 1000,
    productNameAtOrder: `Товар ${itemIndex + 1}`,
    productId: { _id: `p${itemIndex}`, productName: `Товар ${itemIndex + 1}` },
    itemIndex,
  })),
  shipments: [
    { sellerId: SELLER, fulfillmentMethod: "delivery", deliveryCarrier: "seller" },
  ],
});

/**
 * @param {{
 *   statuses: string[];
 *   attentionRole?: "buyer" | "seller";
 *   onCancelOrder?: () => void;
 *   onCancelItem?: () => void;
 * }} input
 */
const renderCard = ({
  statuses,
  attentionRole = "seller",
  onCancelOrder = vi.fn(),
  onCancelItem = vi.fn(),
}) => ({
  onCancelOrder,
  onCancelItem,
  ...renderWithProviders(
    <OrderCard
      order={makeOrder(statuses)}
      attentionRole={attentionRole}
      onCancelOrder={onCancelOrder}
      onCancelItem={onCancelItem}
      onAdvanceShipment={vi.fn()}
    />,
  ),
});

const cancelOrderButton = () =>
  screen.queryByRole("button", { name: ORDER_CARD_UI.ACTION_CANCEL_ORDER });

describe("кнопка «Отменить заказ»", () => {
  it("стоит в строке отправления первой — левее ступени продавца", () => {
    const { container } = renderCard({ statuses: ["pending"] });

    const buttons = [
      ...container.querySelectorAll(".order-card__shipment-actions button"),
    ];
    expect(buttons[0]?.textContent).toBe(ORDER_CARD_UI.ACTION_CANCEL_ORDER);
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("одна на весь заказ, сколько бы позиций в нём ни было", () => {
    renderCard({ statuses: ["pending", "accepted", "assembling"] });

    expect(
      screen.getAllByRole("button", { name: ORDER_CARD_UI.ACTION_CANCEL_ORDER }),
    ).toHaveLength(1);
  });

  it("есть у покупателя на тех же ступенях", () => {
    renderCard({ statuses: ["ready_to_ship"], attentionRole: "buyer" });

    expect(cancelOrderButton()).not.toBeNull();
  });

  it("нет, когда хоть одна позиция уехала: дальше только возврат", () => {
    renderCard({ statuses: ["pending", "shipped"] });

    expect(cancelOrderButton()).toBeNull();
  });

  it("нет на уже отменённом заказе", () => {
    renderCard({ statuses: ["cancelled"] });

    expect(cancelOrderButton()).toBeNull();
  });

  it("гасит заказ отправлением: id заказа и продавца", async () => {
    const onCancelOrder = vi.fn();
    renderCard({ statuses: ["pending", "accepted"], onCancelOrder });

    await userEvent.click(cancelOrderButton());
    expect(screen.getByText(ORDER_CARD_UI.CANCEL_CONFIRM)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: FORMAT_BOOLEAN_RU.YES }));

    expect(onCancelOrder).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      sellerId: SELLER,
    });
  });

  it("покупателю спрашивает про его заказ, продавцу — про заказ покупателя", async () => {
    const { unmount } = renderCard({
      statuses: ["pending"],
      attentionRole: "buyer",
    });
    await userEvent.click(cancelOrderButton());
    expect(screen.getByText(ORDER_CARD_UI.BUYER_CANCEL_CONFIRM)).toBeTruthy();
    unmount();

    renderCard({ statuses: ["pending"], attentionRole: "seller" });
    await userEvent.click(cancelOrderButton());
    expect(screen.getByText(ORDER_CARD_UI.CANCEL_CONFIRM)).toBeTruthy();
  });
});

describe("ступень отправления после отмены позиции", () => {
  it("продавцу предлагается следующая ступень живых позиций, а не «Принять»", () => {
    // Сервер считает переход по живым позициям: пока карточка смотрела на
    // отменённую строку, кнопка «Принять» отвечала 409.
    renderCard({ statuses: ["accepted", "cancelled"] });

    expect(
      screen.queryByRole("button", {
        name: SHIPMENT_ADVANCE_BUTTON_LABEL_RU.accepted,
      }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: SHIPMENT_ADVANCE_BUTTON_LABEL_RU.assembling,
      }),
    ).toBeTruthy();
  });

  it("отгруженная позиция не сбрасывает ступень вернувшейся строкой", () => {
    renderCard({ statuses: ["assembling", "returned"] });

    expect(
      screen.getByRole("button", {
        name: SHIPMENT_ADVANCE_BUTTON_LABEL_RU.ready_to_ship,
      }),
    ).toBeTruthy();
  });
});

describe("вид отменённой строки", () => {
  it("помечена «Отмена» и приглушена, живая строка — нет", () => {
    const { container } = renderCard({ statuses: ["pending", "cancelled"] });
    const items = [...container.querySelectorAll(".order-card__item")];

    expect(items[0].className).not.toContain("order-card__item_cancelled");
    expect(items[0].textContent).not.toContain(ORDER_CARD_UI.ITEM_CANCELLED_BADGE);
    expect(items[1].className).toContain("order-card__item_cancelled");
    expect(
      items[1].querySelector(".order-card__item-cancelled-badge")?.textContent,
    ).toBe(ORDER_CARD_UI.ITEM_CANCELLED_BADGE);
  });

  it("метка видна обеим сторонам", () => {
    for (const attentionRole of ["buyer", "seller"]) {
      const { container, unmount } = renderCard({
        statuses: ["cancelled"],
        attentionRole,
      });

      expect(
        container.querySelector(".order-card__item-cancelled-badge")?.textContent,
      ).toBe(ORDER_CARD_UI.ITEM_CANCELLED_BADGE);
      unmount();
    }
  });
});

describe("отмена одной позиции", () => {
  it("остаётся у строки и снимает ровно её", async () => {
    const onCancelItem = vi.fn();
    const { container } = renderCard({
      statuses: ["pending", "pending"],
      onCancelItem,
    });

    const itemRows = [...container.querySelectorAll(".order-card__item-actions-row")];
    const secondItemCancel = [...itemRows[1].querySelectorAll("button")].find(
      (button) => button.textContent === ORDER_CARD_UI.ACTION_CANCEL,
    );

    await userEvent.click(secondItemCancel);
    expect(screen.getByText(ORDER_CARD_UI.ITEM_CANCEL_CONFIRM)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: FORMAT_BOOLEAN_RU.YES }));

    expect(onCancelItem).toHaveBeenCalledWith({ orderId: ORDER_ID, itemIndex: 1 });
  });
});
