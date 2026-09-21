import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const createMock = vi.fn();
const refreshMock = vi.fn();
const labelMock = vi.fn();
vi.mock("../api/yandexDeliveryRequestApi.js", () => ({
  createYandexDeliveryRequest: (...args) => createMock(...args),
  refreshYandexDeliveryRequest: (...args) => refreshMock(...args),
  fetchYandexDeliveryLabel: (...args) => labelMock(...args),
}));

const { YandexShipmentPanel } = await import("./YandexShipmentPanel.jsx");

const SNAPSHOT = {
  deliverySumRub: 731,
  paymentCommissionRub: 2415.6,
  pickupPoint: { id: "pvz-1", address: "Грозный, пр. Путина, 1" },
  recipient: { name: "Иван Петров", phone: "+79990001122" },
};

function renderPanel(shipment, props = {}) {
  const onChanged = vi.fn();
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <YandexShipmentPanel
        orderId="order-1"
        shipment={shipment}
        onChanged={onChanged}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onChanged };
}

describe("Яндекс Доставка в карточке продажи", () => {
  beforeEach(() => {
    createMock.mockReset();
    refreshMock.mockReset();
    labelMock.mockReset();
  });

  it("до заявки: куда, кому, деньги и кнопка создания", async () => {
    createMock.mockResolvedValue({
      requestId: "req-1",
      status: "CREATED",
      statusDescription: "Принят",
      sharingUrl: "https://dostavka.yandex.ru/route/abc",
    });
    const { onChanged } = renderPanel({ yandexDeliveryShipmentAtOrder: SNAPSHOT });

    expect(screen.getByText("Грозный, пр. Путина, 1")).toBeTruthy();
    expect(screen.getByText("Иван Петров, +79990001122")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Создать заявку в Яндекс" }));

    await screen.findByText("Принят");
    expect(createMock.mock.calls[0][0]).toBe("order-1");
    expect(onChanged).toHaveBeenCalled();
    expect(
      screen.getByRole("link", { name: "Открыть в Яндексе" }).getAttribute("href"),
    ).toBe("https://dostavka.yandex.ru/route/abc");
    expect(
      screen.getByRole("button", { name: "Ярлык для коробки (PDF)" }),
    ).toBeTruthy();
  });

  it("посылка уже у Яндекса — ярлыка нет, статус обновляется", async () => {
    refreshMock.mockResolvedValue({
      requestId: "req-1",
      status: "DELIVERY_ARRIVED_PICKUP_POINT",
      statusDescription: "Заказ доставлен в пункт назначения",
    });
    renderPanel({
      yandexDeliveryShipmentAtOrder: SNAPSHOT,
      yandexDeliveryRequest: { requestId: "req-1", status: "SORTING_CENTER_AT_START" },
    });

    expect(
      screen.queryByRole("button", { name: "Ярлык для коробки (PDF)" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Обновить статус" }));
    await screen.findByText("Заказ доставлен в пункт назначения");
    expect(refreshMock.mock.calls[0][0]).toBe("order-1");
  });

  it("отмена не прошла — просим отменить в кабинете Яндекса", () => {
    renderPanel({
      yandexDeliveryShipmentAtOrder: SNAPSHOT,
      yandexDeliveryRequest: {
        requestId: "req-1",
        status: "CREATED",
        cancelError: "Уже в пути",
      },
    });

    expect(screen.getByRole("alert").textContent).toContain("dostavka.yandex.ru");
  });

  it("закрытый заказ без заявки — кнопки создания нет", async () => {
    renderPanel({ yandexDeliveryShipmentAtOrder: SNAPSHOT }, { closed: true });

    expect(
      screen.queryByRole("button", { name: "Создать заявку в Яндекс" }),
    ).toBeNull();
    await waitFor(() => expect(createMock).not.toHaveBeenCalled());
  });
});
