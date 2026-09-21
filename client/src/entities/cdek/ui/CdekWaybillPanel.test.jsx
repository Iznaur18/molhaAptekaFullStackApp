import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const createCdekWaybillMock = vi.fn();
const refreshCdekWaybillMock = vi.fn();
const fetchCdekReceptionPointsMock = vi.fn();

vi.mock("../api/cdekWaybillApi.js", () => ({
  createCdekWaybill: (...args) => createCdekWaybillMock(...args),
  refreshCdekWaybill: (...args) => refreshCdekWaybillMock(...args),
  fetchCdekReceptionPoints: (...args) => fetchCdekReceptionPointsMock(...args),
}));

const { CdekWaybillPanel } = await import("./CdekWaybillPanel.jsx");

const SNAPSHOT = {
  tariffCode: 136,
  deliveryMode: 4,
  deliverySumRub: 435,
  pickupPoint: { code: "KZN12", address: "Казань, ул. Баумана, 1" },
};

function renderPanel(shipment, onChanged = vi.fn()) {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <CdekWaybillPanel orderId="order-1" shipment={shipment} onChanged={onChanged} />
    </QueryClientProvider>,
  );
  return { onChanged };
}

describe("накладная СДЭК в карточке продажи", () => {
  beforeEach(() => {
    createCdekWaybillMock.mockReset();
    refreshCdekWaybillMock.mockReset();
    fetchCdekReceptionPointsMock.mockReset();
  });

  it("склад-склад: без пункта приёма создать нельзя, с пунктом — уходит его код", async () => {
    fetchCdekReceptionPointsMock.mockResolvedValue([
      { code: "GRZ3", name: "Грозный-3", address: "Грозный, пр. Путина, 3" },
    ]);
    createCdekWaybillMock.mockResolvedValue({
      uuid: "u-1",
      cdekNumber: "1234567890",
      status: "Создан",
    });
    const { onChanged } = renderPanel({ cdekShipmentAtOrder: SNAPSHOT });

    expect(screen.getByText("Казань, ул. Баумана, 1")).toBeTruthy();
    const createButton = screen.getByRole("button", { name: "Создать накладную" });
    expect(createButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Город, где сдадите посылку"), {
      target: { value: "Грозный" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));
    const select = await screen.findByLabelText("Пункт СДЭК, куда отвезёте посылку");
    expect(fetchCdekReceptionPointsMock.mock.calls[0][0]).toBe("Грозный");

    fireEvent.change(select, { target: { value: "GRZ3" } });
    expect(createButton.disabled).toBe(false);
    fireEvent.click(createButton);

    await screen.findByText("1234567890");
    expect(createCdekWaybillMock.mock.calls[0][0]).toEqual({
      orderId: "order-1",
      shipmentPointCode: "GRZ3",
    });
    expect(onChanged).toHaveBeenCalled();
    expect(screen.getByText("1234567890").closest("a")?.getAttribute("href")).toContain(
      "cdek.ru",
    );
  });

  it("дверь-склад: пункт приёма не спрашиваем", async () => {
    createCdekWaybillMock.mockResolvedValue({ uuid: "u-2", cdekNumber: null });
    renderPanel({ cdekShipmentAtOrder: { ...SNAPSHOT, deliveryMode: 2 } });

    expect(screen.queryByLabelText("Город, где сдадите посылку")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Создать накладную" }));
    await waitFor(() =>
      expect(createCdekWaybillMock.mock.calls[0][0]).toEqual({
        orderId: "order-1",
        shipmentPointCode: null,
      }),
    );
    await screen.findByText(/ещё присваивает номер/);
  });

  it("готовая накладная: показывает ошибку СДЭК и обновляет статус", async () => {
    refreshCdekWaybillMock.mockResolvedValue({
      uuid: "u-3",
      cdekNumber: "555",
      status: "Принят на склад отправителя",
      error: null,
    });
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: { uuid: "u-3", cdekNumber: null, error: "Неверный телефон" },
    });

    expect(screen.getByRole("alert").textContent).toContain("Неверный телефон");
    fireEvent.click(screen.getByRole("button", { name: "Обновить статус" }));
    await screen.findByText("Принят на склад отправителя");
    expect(refreshCdekWaybillMock.mock.calls[0][0]).toBe("order-1");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
