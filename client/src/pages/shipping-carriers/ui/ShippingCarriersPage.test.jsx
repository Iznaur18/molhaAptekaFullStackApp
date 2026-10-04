import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SHIPPING_CARRIERS_ADMIN_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

const toggleMock = vi.fn();
const saveInfoMock = vi.fn();

vi.mock("../../../entities/shipping/model/shippingCarrierQueries.js", () => ({
  useStaffShippingCarriersQuery: () => ({
    data: [
      {
        carrierId: "seller",
        label: "Доставка продавцом",
        enabled: true,
        configured: true,
        available: true,
        regions: null,
      },
      {
        carrierId: "gitorg_courier",
        label: "Курьеры Gitorg",
        enabled: false,
        configured: true,
        available: false,
        regions: null,
      },
      {
        carrierId: "lobo",
        label: "ЛОБО",
        enabled: false,
        configured: false,
        available: false,
        regions: ["RU-CE"],
      },
    ],
    isPending: false,
    isError: false,
  }),
  useToggleShippingCarrierMutation: () => ({ mutateAsync: toggleMock }),
  useStaffShippingCarrierInfoQuery: () => ({
    data: [
      {
        carrierId: "cdek",
        label: "СДЭК",
        description: "",
        workHours: "Тестовый график",
        coverage: "",
        phone: "",
        website: "",
      },
    ],
    isPending: false,
    isError: false,
  }),
  useSaveShippingCarrierInfoMutation: () => ({
    mutateAsync: saveInfoMock,
    isPending: false,
  }),
}));

const { ShippingCarriersPage } = await import("./ShippingCarriersPage.jsx");

describe("панель служб доставки", () => {
  it("показывает состояние каждой службы", () => {
    renderWithProviders(<ShippingCarriersPage />);

    expect(screen.getByText("Доставка продавцом")).toBeTruthy();
    expect(screen.getByText("Курьеры Gitorg")).toBeTruthy();
    expect(screen.getByText("ЛОБО")).toBeTruthy();
    expect(screen.getAllByText(SHIPPING_CARRIERS_ADMIN_UI.STATE_ON).length).toBe(1);
  });

  it("ненастроенную включать нечем — кнопки нет", () => {
    renderWithProviders(<ShippingCarriersPage />);

    expect(screen.getByText(SHIPPING_CARRIERS_ADMIN_UI.NOT_CONFIGURED)).toBeTruthy();
    // Кнопок ровно две: у настроенных служб.
    expect(
      screen.queryAllByRole("button", {
        name: SHIPPING_CARRIERS_ADMIN_UI.ACTION_ENABLE,
      }).length,
    ).toBe(1);
  });

  it("региональная служба подписана своим регионом", () => {
    renderWithProviders(<ShippingCarriersPage />);

    expect(
      screen.getByText(SHIPPING_CARRIERS_ADMIN_UI.REGIONS(["RU-CE"])),
    ).toBeTruthy();
    expect(screen.getAllByText(SHIPPING_CARRIERS_ADMIN_UI.REGIONS_ALL).length).toBe(2);
  });

  it("выключение спрашивает подтверждение и шлёт запрос", () => {
    toggleMock.mockClear();
    renderWithProviders(<ShippingCarriersPage />);

    fireEvent.click(
      screen.getByRole("button", { name: SHIPPING_CARRIERS_ADMIN_UI.ACTION_DISABLE }),
    );
    // Подтверждение встроенное: браузерные диалоги можно заблокировать.
    fireEvent.click(screen.getByRole("button", { name: "Да" }));

    expect(toggleMock).toHaveBeenCalledWith({
      carrierId: "seller",
      enabled: false,
    });
  });

  it("справка службы сохраняется целиком, пробелы срезаются", async () => {
    saveInfoMock.mockClear();
    saveInfoMock.mockResolvedValue([]);
    renderWithProviders(<ShippingCarriersPage />);

    fireEvent.change(screen.getByLabelText("Телефон"), {
      target: { value: " 8 (800) 000-00-00 " },
    });
    fireEvent.click(
      screen.getByRole("button", { name: SHIPPING_CARRIERS_ADMIN_UI.INFO_SAVE }),
    );

    expect(saveInfoMock).toHaveBeenCalledWith({
      carrierId: "cdek",
      info: {
        description: "",
        workHours: "Тестовый график",
        coverage: "",
        phone: "8 (800) 000-00-00",
        website: "",
      },
    });
    expect(await screen.findByText(SHIPPING_CARRIERS_ADMIN_UI.INFO_SAVED)).toBeTruthy();
  });

  it("кривой телефон в справке не уходит на сервер", () => {
    saveInfoMock.mockClear();
    renderWithProviders(<ShippingCarriersPage />);

    fireEvent.change(screen.getByLabelText("Телефон"), {
      target: { value: "звоните нам" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: SHIPPING_CARRIERS_ADMIN_UI.INFO_SAVE }),
    );

    expect(saveInfoMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Телефон");
  });
});
