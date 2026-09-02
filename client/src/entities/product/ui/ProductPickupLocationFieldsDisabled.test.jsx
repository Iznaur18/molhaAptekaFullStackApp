import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

// Админ выключил курьеров Gitorg — служба должна исчезнуть с формы товара.
vi.mock("../../shipping/model/shippingCarrierQueries.js", () => ({
  useShippingCarriersQuery: () => ({
    data: [
      { carrierId: "seller", available: true },
      { carrierId: "gitorg_courier", available: false },
      { carrierId: "lobo", available: true },
    ],
  }),
}));

const { ProductPickupLocationFields } = await import(
  "./ProductPickupLocationFields.jsx"
);

describe("выключенная админом служба", () => {
  it("не предлагается продавцу", () => {
    renderWithProviders(
      <ProductPickupLocationFields
        locations={[
          {
            id: "loc-1",
            address: "г Грозный, ул Мира, 1",
            lat: 43.31,
            lon: 45.69,
            isDefault: true,
          },
        ]}
        pickupEnabled={false}
        deliveryEnabled={false}
        productDeliveryCarrier="lobo"
        productRegionCode="RU-CE"
        sellerRegionCode="RU-CE"
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByText("Курьеры Gitorg")).toBeNull();
    // Остальные на месте: выключили одну, а не все.
    expect(screen.getByText("ЛОБО")).toBeTruthy();
    expect(screen.getByText("Доставка продавцом")).toBeTruthy();
  });
});
