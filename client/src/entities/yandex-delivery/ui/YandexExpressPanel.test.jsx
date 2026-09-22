import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const createMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("../api/yandexExpressClaimApi.js", () => ({
  createYandexExpressClaim: (...args) => createMock(...args),
  refreshYandexExpressClaim: (...args) => refreshMock(...args),
}));

const { YandexExpressPanel } = await import("./YandexExpressPanel.jsx");

const SNAPSHOT = {
  deliverySumRub: 412,
  etaMinutes: 35,
  pickup: { address: "Грозный, ул. Лорсанова, 5" },
  dropoff: { address: "Грозный, пр. Путина, 1", flat: "12" },
  recipient: { name: "Иван Петров", phone: "+79990001122" },
};

function renderPanel(shipment, props = {}) {
  const onChanged = vi.fn();
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <YandexExpressPanel
        orderId="order-1"
        shipment={shipment}
        onChanged={onChanged}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onChanged };
}

describe("«Экспресс» в карточке продажи", () => {
  beforeEach(() => {
    createMock.mockReset();
    refreshMock.mockReset();
  });

  it("до вызова: откуда, куда, деньги и кнопка вызова курьера", async () => {
    createMock.mockResolvedValue({
      claimId: "claim-1",
      status: "performer_lookup",
      sharingUrl: "https://dostavka.yandex.ru/route/abc",
    });
    const { onChanged } = renderPanel({ yandexExpressShipmentAtOrder: SNAPSHOT });

    expect(screen.getByText("Грозный, ул. Лорсанова, 5")).toBeTruthy();
    expect(screen.getByText("Грозный, пр. Путина, 1, кв. 12")).toBeTruthy();
    expect(screen.getByText("Иван Петров, +79990001122")).toBeTruthy();
    expect(screen.getByText("35 мин")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Вызвать курьера" }));
    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith("order-1", expect.anything()),
    );
    expect(await screen.findByText("Ищем курьера")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Открыть в Яндексе" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Вызвать курьера" })).toBeNull();
    expect(onChanged).toHaveBeenCalled();
  });

  it("курьер ждёт код — показываем код передачи", () => {
    renderPanel({
      yandexExpressShipmentAtOrder: SNAPSHOT,
      yandexExpressClaim: {
        claimId: "claim-1",
        status: "ready_for_pickup_confirmation",
        pickupCode: "4821",
      },
    });
    expect(screen.getByText("4821")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Обновить статус" })).toBeTruthy();
  });

  it("курьер не нашёлся — можно вызвать заново", () => {
    renderPanel({
      yandexExpressShipmentAtOrder: SNAPSHOT,
      yandexExpressClaim: { claimId: "claim-1", status: "performer_not_found" },
    });
    expect(screen.getByText("Курьер не нашёлся")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Вызвать курьера заново" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Обновить статус" })).toBeNull();
  });

  it("закрытый заказ — без кнопок", () => {
    renderPanel({ yandexExpressShipmentAtOrder: SNAPSHOT }, { closed: true });
    expect(screen.queryByRole("button")).toBeNull();
  });
});
