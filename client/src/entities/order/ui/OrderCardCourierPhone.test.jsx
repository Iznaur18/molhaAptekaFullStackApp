import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { OrderCard } = await import("./OrderCard.jsx");

const SELLER = "aaaaaaaaaaaaaaaaaaaaaaaa";

/**
 * Отправление с назначенным курьером.
 *
 * @param {Record<string, any>} courier
 * @param {Record<string, any>} [shipmentPatch]
 */
const makeOrder = (courier, shipmentPatch = {}) => ({
  _id: "order-1",
  status: "in_delivery",
  createdAt: new Date().toISOString(),
  totalAmount: 1000,
  fulfillmentMethod: "delivery",
  paymentMethod: "cashOnDelivery",
  userBuyerId: { _id: "buyer-1", userName: "Покупатель" },
  items: [
    {
      sellerIdAtOrder: SELLER,
      status: "in_delivery",
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
      fulfillmentMethod: "delivery",
      deliveryCarrier: "lobo",
      courierId: null,
      courier,
      ...shipmentPatch,
    },
  ],
});

describe("телефон курьера службы в карточке заказа", () => {
  it("покупатель видит номер и может позвонить", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder({
          userName: "Рустам",
          phone: "+79288936449",
          rating: null,
          vehicleMake: "ВАЗ",
          vehicleColor: "Чёрный",
          vehiclePlate: "М636РВ95",
        })}
        attentionRole="buyer"
      />,
    );

    const phone = screen.getByRole("link", { name: "8 (928) 893-64-49" });
    expect(phone.getAttribute("href")).toBe("tel:+79288936449");
    expect(screen.getByText("Рустам")).toBeTruthy();
  });

  it("у курьера Gitorg номера нет — звонят через заказ", () => {
    renderWithProviders(
      <OrderCard
        order={makeOrder(
          { userName: "Курьер Gitorg", rating: 4.8 },
          { deliveryCarrier: "gitorg_courier", courierDelivery: true },
        )}
        attentionRole="buyer"
      />,
    );

    expect(screen.queryByRole("link", { name: /\+7/ })).toBeNull();
  });
});
