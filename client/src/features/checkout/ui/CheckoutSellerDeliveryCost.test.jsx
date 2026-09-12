import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const { CheckoutSellerDeliveryCost } = await import("./CheckoutSellerDeliveryCost.jsx");

const TARIFF = { paid: true, baseFeeRub: 180, perKmRub: 30, freeFromRub: 0 };

/** @param {Partial<{ distanceKm: number | null; distanceSource: string | null; isLoading: boolean; errorMessage: string }>} distance */
const setup = (distance) =>
  renderWithProviders(
    <CheckoutSellerDeliveryCost
      tariff={TARIFF}
      goodsTotalRub={386}
      distance={{
        distanceKm: null,
        distanceSource: null,
        isLoading: false,
        errorMessage: "",
        ...distance,
      }}
    />,
  );

describe("стоимость доставки продавца в корзине", () => {
  it("пока адрес не выбран — «от» цены за вызов", () => {
    setup({});
    expect(screen.getByText(/от 180/)).toBeTruthy();
    expect(screen.getByText(/зависит от расстояния по дорогам/)).toBeTruthy();
  });

  it("пока сервер считает маршрут — так и пишем", () => {
    setup({ isLoading: true });
    expect(screen.getByRole("status").textContent).toMatch(/Считаем расстояние/);
  });

  it("расстояние по дорогам от сервера — точная сумма и километры", () => {
    setup({ distanceKm: 3.171, distanceSource: "road" });
    // 3,171 км → 4 полных: 180 + 4 * 30 = 300
    expect(screen.getAllByText(/300/).length).toBeGreaterThan(0);
    expect(screen.getByText("4 км по дорогам")).toBeTruthy();
    expect(screen.getByText(/OpenStreetMap/)).toBeTruthy();
  });

  it("маршрут не построился — оценку помечаем", () => {
    setup({ distanceKm: 14.46, distanceSource: "estimate" });
    expect(screen.getByText(/≈ 15 км по дорогам/)).toBeTruthy();
  });

  it("адрес не нашёлся — показываем причину, а не молчим", () => {
    setup({ errorMessage: "Не удалось найти адрес доставки на карте" });
    expect(screen.getByRole("alert").textContent).toMatch(/Не удалось найти адрес/);
  });
});
