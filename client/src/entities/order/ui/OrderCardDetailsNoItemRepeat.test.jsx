import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

const makeItem = (name, itemIndex, patch = {}) => ({
  sellerIdAtOrder: SELLER,
  status: "pending",
  quantity: 1,
  unitPriceAtOrder: 100,
  productNameAtOrder: name,
  productId: { _id: `p${itemIndex}`, productName: name },
  itemIndex,
  ...patch,
});

const makeOrder = (items) => ({
  _id: "order-1",
  status: "pending",
  createdAt: new Date().toISOString(),
  totalAmount: 200,
  fulfillmentMethod: "delivery",
  paymentMethod: "cash",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items,
  shipments: [{ sellerId: SELLER, fulfillmentMethod: "delivery" }],
});

describe("подробности компактной карточки не повторяют позиции", () => {
  it("название товара без доп. сведений встречается один раз", () => {
    renderWithProviders(
      <OrderCard
        compact
        order={makeOrder([makeItem("Вода", 0), makeItem("Напиток", 1)])}
        attentionRole="buyer"
      />,
    );

    expect(screen.getAllByText("Вода")).toHaveLength(1);
    expect(screen.getAllByText("Напиток")).toHaveLength(1);
    expect(document.querySelector(".order-card__item-extras")).toBeNull();
  });

  it("напротив позиции видна её сумма, при нескольких штуках — и цена за штуку", () => {
    renderWithProviders(
      <OrderCard
        compact
        order={makeOrder([
          makeItem("Вода", 0, { quantity: 4, unitPriceAtOrder: 250 }),
          makeItem("Напиток", 1),
        ])}
        attentionRole="buyer"
      />,
    );

    const blocks = [...document.querySelectorAll(".order-card__item-price-block")].map(
      (node) => node.textContent,
    );
    expect(blocks).toEqual([
      `${formatPriceRub(1000)}4 × ${formatPriceRub(250)}`,
      formatPriceRub(100),
    ]);
  });

  it("если у позиции есть баллы, подпись с названием остаётся", () => {
    renderWithProviders(
      <OrderCard
        compact
        order={makeOrder([
          makeItem("Вода", 0, { loyaltyPointsPerUnitAtOrder: 5 }),
          makeItem("Напиток", 1),
        ])}
        attentionRole="buyer"
      />,
    );

    const extras = document.querySelectorAll(".order-card__item-extras");
    expect(extras).toHaveLength(1);
    expect(extras[0].textContent).toContain("Вода");
  });
});
