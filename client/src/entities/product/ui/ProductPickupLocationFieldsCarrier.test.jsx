import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

// Список служб приходит с сервера; здесь проверяем не его, а раскладку по
// регионам и запись выбора.
vi.mock("../../shipping/model/shippingCarrierQueries.js", () => ({
  useShippingCarriersQuery: () => ({
    data: [
      { carrierId: "seller", available: true },
      { carrierId: "gitorg_courier", available: true },
      { carrierId: "lobo", available: true },
    ],
  }),
}));

const { ProductPickupLocationFields } =
  await import("./ProductPickupLocationFields.jsx");

const LOCATION = {
  id: "loc-1",
  address: "г Грозный, ул Мира, 1",
  lat: 43.31,
  lon: 45.69,
  isDefault: true,
};

/** @param {{ region: string; carrier?: string; onChange?: () => void }} options */
const renderFields = ({ region, carrier = "", onChange = vi.fn() }) =>
  renderWithProviders(
    <ProductPickupLocationFields
      locations={[LOCATION]}
      pickupEnabled={false}
      deliveryEnabled={false}
      courierDeliveryEnabled={carrier === "gitorg_courier"}
      productDeliveryCarrier={carrier}
      productRegionCode={region}
      sellerRegionCode={region}
      onChange={onChange}
    />,
  );

describe("выбор перевозчика на товаре", () => {
  it("в Чечне ЛОБО предлагается", () => {
    renderFields({ region: "RU-CE", carrier: "gitorg_courier" });

    expect(screen.getByText("ЛОБО")).toBeTruthy();
  });

  it("в других регионах ЛОБО не показывается", () => {
    renderFields({ region: "RU-MOW", carrier: "gitorg_courier" });

    expect(screen.queryByText("ЛОБО")).toBeNull();
  });

  it("выбор ЛОБО гасит оба старых флага", () => {
    const onChange = vi.fn();
    renderFields({ region: "RU-CE", carrier: "gitorg_courier", onChange });

    fireEvent.click(screen.getByText("ЛОБО"));

    const patch = onChange.mock.calls.at(-1)?.[0];
    expect(patch.productDeliveryCarrier).toBe("lobo");
    expect(patch.productDeliveryEnabled).toBe(false);
    expect(patch.productCourierDeliveryEnabled).toBe(false);
  });

  it("выбор курьеров Gitorg поднимает свой флаг", () => {
    const onChange = vi.fn();
    renderFields({ region: "RU-CE", carrier: "lobo", onChange });

    fireEvent.click(screen.getByText("Курьеры Gitorg"));

    const patch = onChange.mock.calls.at(-1)?.[0];
    expect(patch.productDeliveryCarrier).toBe("gitorg_courier");
    expect(patch.productCourierDeliveryEnabled).toBe(true);
    expect(patch.productDeliveryEnabled).toBe(false);
  });
});

describe("адрес отправки у внешней службы", () => {
  const SAVED = [
    {
      id: "addr-1",
      label: "Склад",
      address: "г Грозный, ул Мира, 1",
      lat: 43.31,
      lon: 45.69,
    },
  ];

  /** @param {string} carrier */
  const renderWithAddresses = (carrier) =>
    renderWithProviders(
      <ProductPickupLocationFields
        locations={[LOCATION]}
        pickupEnabled={false}
        deliveryEnabled={carrier === "seller"}
        courierDeliveryEnabled={carrier === "gitorg_courier"}
        productDeliveryCarrier={carrier}
        productRegionCode="RU-CE"
        sellerRegionCode="RU-CE"
        savedAddresses={SAVED}
        onChange={vi.fn()}
      />,
    );

  it("ЛОБО: адрес отправки виден и подписан, откуда заберут", () => {
    renderWithAddresses("lobo");

    expect(screen.getByText("Адрес отправки")).toBeTruthy();
    expect(screen.getByText(/Отсюда курьер службы ЛОБО заберёт товар/)).toBeTruthy();
  });

  it("доставка продавцом: тот же раздел, со своей подписью", () => {
    renderWithAddresses("seller");

    expect(screen.getByText("Адрес отправки")).toBeTruthy();
    expect(screen.getByText(/Отсюда вы повезёте товар покупателю/)).toBeTruthy();
  });
});
