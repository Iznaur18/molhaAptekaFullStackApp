import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { COURIER_OVERVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

vi.mock("../../../entities/courier/model/courierQueries.js", () => ({
  useConfirmCourierHandoverMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useStartCourierDeliveryMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useMarkCourierArrivedMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useCompleteCourierDeliveryMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useDeclineCourierShipmentMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

const { CourierDeliveryCard } = await import("./CourierDeliveryCard.jsx");

function makeDelivery(overrides = {}) {
  return {
    orderId: "o1",
    sellerId: "s1",
    sellerName: "seller",
    sellerPhone: "+7000",
    status: "delivered",
    paymentMethod: "cardOnDelivery",
    paymentConfirmed: false,
    deliveryFeeRub: 175,
    pickupAddress: "pickup",
    buyerId: "b1",
    buyerName: "buyer",
    buyerPhone: "+7111",
    deliveryAddress: "dropoff",
    contactsUnlocked: true,
    items: [{ productId: "p1", name: "Товар", quantity: 1, imageUrl: "" }],
    ...overrides,
  };
}

describe("CourierDeliveryCard — оплата", () => {
  it("показывает «Ожидает оплаты» пока продавец не подтвердил", () => {
    renderWithProviders(
      <CourierDeliveryCard delivery={makeDelivery()} onError={vi.fn()} />,
    );

    expect(screen.getByText(COURIER_OVERVIEW_UI.PAYMENT_AWAITING)).toBeTruthy();
    expect(screen.queryByText(COURIER_OVERVIEW_UI.PAYMENT_RECEIVED)).toBeNull();
  });

  it("показывает «Оплата получена» после подтверждения", () => {
    renderWithProviders(
      <CourierDeliveryCard
        delivery={makeDelivery({ paymentConfirmed: true })}
        onError={vi.fn()}
      />,
    );

    expect(screen.getByText(COURIER_OVERVIEW_UI.PAYMENT_RECEIVED)).toBeTruthy();
    expect(screen.queryByText(COURIER_OVERVIEW_UI.PAYMENT_AWAITING)).toBeNull();
  });

  it("блок не показывается без cardOnDelivery", () => {
    renderWithProviders(
      <CourierDeliveryCard
        delivery={makeDelivery({ paymentMethod: "cashOnDelivery" })}
        onError={vi.fn()}
      />,
    );

    expect(screen.queryByText(COURIER_OVERVIEW_UI.PAYMENT_AWAITING)).toBeNull();
    expect(screen.queryByText(COURIER_OVERVIEW_UI.PAYMENT_RECEIVED)).toBeNull();
  });
});
