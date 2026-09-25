import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const createCdekWaybillMock = vi.fn();
const refreshCdekWaybillMock = vi.fn();
const fetchCdekReceptionPointsMock = vi.fn();
const fetchCdekLabelMock = vi.fn();
const createCdekIntakeMock = vi.fn();

vi.mock("../api/cdekWaybillApi.js", () => ({
  createCdekWaybill: (...args) => createCdekWaybillMock(...args),
  refreshCdekWaybill: (...args) => refreshCdekWaybillMock(...args),
  fetchCdekReceptionPoints: (...args) => fetchCdekReceptionPointsMock(...args),
  fetchCdekLabel: (...args) => fetchCdekLabelMock(...args),
  createCdekIntake: (...args) => createCdekIntakeMock(...args),
}));

const { CdekWaybillPanel } = await import("./CdekWaybillPanel.jsx");

const SNAPSHOT = {
  tariffCode: 136,
  deliveryMode: 4,
  deliverySumRub: 435,
  pickupPoint: { code: "KZN12", address: "Казань, ул. Баумана, 1" },
};

function renderPanel(
  shipment,
  onChanged = vi.fn(),
  closed = false,
  awaitingPayment = false,
) {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <CdekWaybillPanel
        orderId="order-1"
        shipment={shipment}
        onChanged={onChanged}
        closed={closed}
        awaitingPayment={awaitingPayment}
      />
    </QueryClientProvider>,
  );
  return { onChanged };
}

describe("накладная СДЭК в карточке продажи", () => {
  beforeEach(() => {
    createCdekWaybillMock.mockReset();
    refreshCdekWaybillMock.mockReset();
    fetchCdekReceptionPointsMock.mockReset();
    fetchCdekLabelMock.mockReset();
    createCdekIntakeMock.mockReset();
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

    // Адрес пункта и номер СДЭК — в «Подробностях заказа», не в панели.
    expect(screen.queryByText("Казань, ул. Баумана, 1")).toBeNull();
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

    await screen.findByText("Создан");
    expect(createCdekWaybillMock.mock.calls[0][0]).toEqual({
      orderId: "order-1",
      shipmentPointCode: "GRZ3",
    });
    expect(onChanged).toHaveBeenCalled();
    expect(screen.queryByText("1234567890")).toBeNull();
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
  });

  it("готовая накладная: показывает ошибку СДЭК, кнопки обновления нет", () => {
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: { uuid: "u-3", cdekNumber: null, error: "Неверный телефон" },
    });

    expect(screen.getByRole("alert").textContent).toContain("Неверный телефон");
    // Статус обновляется сам (опрос раз в полчаса) — кнопку убрали.
    expect(screen.queryByRole("button", { name: "Обновить статус" })).toBeNull();
  });

  it("закрытый заказ: без кнопок и подсказки", () => {
    renderPanel(
      {
        cdekShipmentAtOrder: SNAPSHOT,
        cdekWaybill: { uuid: "u-4", cdekNumber: "777" },
      },
      vi.fn(),
      true,
    );

    expect(screen.queryByText("777")).toBeNull();
    expect(screen.queryByRole("button", { name: "Обновить статус" })).toBeNull();
    expect(screen.queryByText(/меняется сам/)).toBeNull();
  });

  it("отмена не прошла в СДЭК — просим отменить в кабинете", () => {
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: { uuid: "u-5", cdekNumber: "555", cancelError: "Заказ уже в пути" },
    });

    expect(screen.getByRole("alert").textContent).toContain("lk.cdek.ru");
    expect(screen.getByRole("alert").textContent).toContain("Заказ уже в пути");
  });

  it("посылку везут обратно — говорим об этом и показываем статус возврата", () => {
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: {
        uuid: "u-6",
        cdekNumber: "666",
        returnUuid: "r-6",
        returnStatus: "Отправлен в г. транзит",
      },
    });

    expect(screen.getByText(/везёт её обратно/)).toBeTruthy();
    expect(screen.getByText(/Отправлен в г. транзит/)).toBeTruthy();
  });

  it("предоплата не пришла — накладную не предлагаем", () => {
    renderPanel({ cdekShipmentAtOrder: SNAPSHOT }, vi.fn(), false, true);

    expect(screen.queryByRole("button", { name: "Создать накладную" })).toBeNull();
    expect(screen.getByText(/когда покупатель оплатит/)).toBeTruthy();
  });

  it("этикетка: качает PDF с номером СДЭК в имени", async () => {
    const createObjectURL = vi.fn(() => "blob:label");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    fetchCdekLabelMock.mockResolvedValue(
      new Blob(["%PDF"], { type: "application/pdf" }),
    );
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: { uuid: "u-7", cdekNumber: "888", statusCode: "CREATED" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Этикетка для коробки (PDF)" }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(fetchCdekLabelMock.mock.calls[0][0]).toBe("order-1");
    expect(createObjectURL).toHaveBeenCalled();
    click.mockRestore();
    vi.unstubAllGlobals();
  });

  it("посылка уже у СДЭК — ни этикетки, ни курьера", () => {
    renderPanel({
      cdekShipmentAtOrder: { ...SNAPSHOT, deliveryMode: 2 },
      cdekWaybill: {
        uuid: "u-8",
        cdekNumber: "999",
        statusCode: "RECEIVED_AT_SHIPMENT_WAREHOUSE",
      },
    });

    expect(
      screen.queryByRole("button", { name: "Этикетка для коробки (PDF)" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Вызвать курьера" })).toBeNull();
  });

  it("тариф «от двери»: вызов курьера уходит с окном и телефоном", async () => {
    createCdekIntakeMock.mockResolvedValue({
      uuid: "u-9",
      cdekNumber: "321",
      statusCode: "CREATED",
      intake: { uuid: "i-9", date: "2030-01-10", timeFrom: "10:00", timeTo: "14:00" },
    });
    renderPanel({
      cdekShipmentAtOrder: { ...SNAPSHOT, deliveryMode: 2 },
      cdekWaybill: { uuid: "u-9", cdekNumber: "321", statusCode: "CREATED" },
    });

    const submit = screen.getByRole("button", { name: "Вызвать курьера" });
    expect(submit.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Телефон для курьера"), {
      target: { value: "+79990001122" },
    });
    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    await screen.findByText(/Курьер вызван: 2030-01-10, с 10:00 до 14:00/);
    const sent = createCdekIntakeMock.mock.calls[0][0];
    expect(sent).toMatchObject({
      orderId: "order-1",
      timeFrom: "10:00",
      timeTo: "14:00",
      phone: "+79990001122",
    });
  });

  it("тариф «склад-склад»: курьера не предлагаем", () => {
    renderPanel({
      cdekShipmentAtOrder: SNAPSHOT,
      cdekWaybill: { uuid: "u-10", cdekNumber: "654", statusCode: "CREATED" },
    });

    expect(screen.queryByRole("button", { name: "Вызвать курьера" })).toBeNull();
  });
});
