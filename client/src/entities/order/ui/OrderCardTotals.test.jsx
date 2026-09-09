import { formatPriceRub } from "@izibuy/shared-lib";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";
const UNIT_PRICE = 1000;

/**
 * Заказ на три штуки в двух строках — сумма, которую видит покупатель при
 * оформлении, сохранена в `totalAmount` и после отмены уже неверна.
 *
 * @param {Array<{ status: string; quantity: number }>} lines
 */
const makeOrder = (lines) => ({
  _id: "order-1",
  status: lines[0].status,
  createdAt: new Date().toISOString(),
  totalAmount: 3 * UNIT_PRICE,
  fulfillmentMethod: "delivery",
  paymentMethod: "cardOnDelivery",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: lines.map(({ status, quantity }, itemIndex) => ({
    sellerIdAtOrder: SELLER,
    status,
    quantity,
    unitPriceAtOrder: UNIT_PRICE,
    productNameAtOrder: `Товар ${itemIndex + 1}`,
    productId: { _id: `p${itemIndex}`, productName: `Товар ${itemIndex + 1}` },
    itemIndex,
  })),
  shipments: [{ sellerId: SELLER, fulfillmentMethod: "delivery" }],
});

/** @param {Array<{ status: string; quantity: number }>} lines */
const renderTotals = (lines) => {
  const { container } = renderWithProviders(
    <OrderCard order={makeOrder(lines)} compact onCancelItem={vi.fn()} />,
  );

  return {
    quantity: container.querySelector(".order-card__quantity")?.textContent ?? "",
    total: container.querySelector(".order-card__total")?.textContent ?? "",
  };
};

describe("свод в шапке карточки", () => {
  it("до отмены показывает все позиции", () => {
    const { quantity, total } = renderTotals([
      { status: "pending", quantity: 2 },
      { status: "pending", quantity: 1 },
    ]);

    expect(quantity).toBe("×3");
    expect(total).toBe(formatPriceRub(3 * UNIT_PRICE));
  });

  it("после отмены одной позиции количество и сумма уменьшаются", () => {
    const { quantity, total } = renderTotals([
      { status: "pending", quantity: 2 },
      { status: "cancelled", quantity: 1 },
    ]);

    expect(quantity).toBe("×2");
    expect(total).toBe(formatPriceRub(2 * UNIT_PRICE));
  });

  it("возвращённая позиция тоже уходит из свода", () => {
    const { quantity, total } = renderTotals([
      { status: "delivered", quantity: 2 },
      { status: "returned", quantity: 1 },
    ]);

    expect(quantity).toBe("×2");
    expect(total).toBe(formatPriceRub(2 * UNIT_PRICE));
  });

  it("на отменённом целиком заказе свода штук нет, сумма нулевая", () => {
    const { quantity, total } = renderTotals([
      { status: "cancelled", quantity: 2 },
      { status: "cancelled", quantity: 1 },
    ]);

    expect(quantity).toBe("");
    expect(total).toBe(formatPriceRub(0));
  });
});
