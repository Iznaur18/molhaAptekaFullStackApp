import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchMock = vi.fn();
const saveMock = vi.fn();
const removeMock = vi.fn();
const toggleMock = vi.fn();
const dropoffPointsMock = vi.fn();
const saveDropoffMock = vi.fn();
const expressMock = vi.fn();

vi.mock("../api/yandexDeliveryCredentialsApi.js", () => ({
  fetchYandexDeliveryConnection: (...args) => fetchMock(...args),
  saveYandexDeliveryConnection: (...args) => saveMock(...args),
  removeYandexDeliveryConnection: (...args) => removeMock(...args),
  toggleYandexDeliveryConnection: (...args) => toggleMock(...args),
  fetchYandexDropoffPoints: (...args) => dropoffPointsMock(...args),
  saveYandexDropoff: (...args) => saveDropoffMock(...args),
}));

vi.mock("../api/yandexExpressClaimApi.js", () => ({
  saveYandexExpressSettings: (...args) => expressMock(...args),
}));

const { YandexDeliveryConnectionCard } =
  await import("./YandexDeliveryConnectionCard.jsx");

const NOT_CONNECTED = {
  connected: false,
  enabled: true,
  environment: "prod",
  tokenMasked: "",
  validatedAt: null,
  lastError: "",
};

function renderCard() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <YandexDeliveryConnectionCard />
    </QueryClientProvider>,
  );
}

describe("карточка подключения Яндекс Доставки", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    saveMock.mockReset();
    removeMock.mockReset();
    toggleMock.mockReset();
    dropoffPointsMock.mockReset();
    saveDropoffMock.mockReset();
  });

  it("без токена: инструкция и боевой контур по умолчанию", async () => {
    fetchMock.mockResolvedValue(NOT_CONNECTED);
    renderCard();

    expect(await screen.findByText("Не подключена")).toBeTruthy();
    expect(screen.getByText(/Токен для API/, { selector: "li" })).toBeTruthy();
    expect(screen.getByLabelText("Контур").value).toBe("prod");
    expect(
      screen.getByRole("button", { name: "Подключить Яндекс Доставку" }).disabled,
    ).toBe(true);
  });

  it("сохраняет токен без пробелов по краям и чистит поле", async () => {
    fetchMock.mockResolvedValue(NOT_CONNECTED);
    saveMock.mockResolvedValue({
      ...NOT_CONNECTED,
      connected: true,
      tokenMasked: "••••4Qk6",
    });
    renderCard();

    const input = await screen.findByLabelText("Токен для API");
    fireEvent.change(input, { target: { value: "  y2_token4Qk6  " } });
    fireEvent.click(screen.getByRole("button", { name: "Подключить Яндекс Доставку" }));

    await screen.findByText("••••4Qk6");
    expect(saveMock.mock.calls[0][0]).toEqual({
      token: "y2_token4Qk6",
      environment: "prod",
    });
    expect(input.value).toBe("");
    expect(
      screen.getByRole("switch", { name: /Продавать через Яндекс Доставку/ }).checked,
    ).toBe(true);
  });

  it("ошибку Яндекса показывает как есть", async () => {
    fetchMock.mockResolvedValue(NOT_CONNECTED);
    saveMock.mockRejectedValue(new Error("Яндекс не принял токен"));
    renderCard();

    fireEvent.change(await screen.findByLabelText("Токен для API"), {
      target: { value: "bad-token-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Подключить Яндекс Доставку" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Яндекс не принял токен"),
    );
  });

  it("тумблер выключает Яндекс Доставку для покупателей", async () => {
    fetchMock.mockResolvedValue({
      ...NOT_CONNECTED,
      connected: true,
      tokenMasked: "••••abcd",
    });
    toggleMock.mockResolvedValue({
      ...NOT_CONNECTED,
      connected: true,
      enabled: false,
      tokenMasked: "••••abcd",
    });
    renderCard();

    fireEvent.click(
      await screen.findByRole("switch", { name: /Продавать через Яндекс Доставку/ }),
    );

    await screen.findByText("Яндекс Доставка скрыта от покупателей");
    expect(toggleMock.mock.calls[0][0]).toBe(false);
  });

  it("без пункта сдачи предупреждает и даёт выбрать пункт", async () => {
    const connected = {
      ...NOT_CONNECTED,
      connected: true,
      tokenMasked: "••••abcd",
      dropoff: null,
    };
    fetchMock.mockResolvedValue(connected);
    dropoffPointsMock.mockResolvedValue([
      { id: "st-1", name: "ПВЗ", address: "Грозный, пр. Путина, 1" },
    ]);
    saveDropoffMock.mockResolvedValue({
      ...connected,
      dropoff: { id: "st-1", name: "ПВЗ", address: "Грозный, пр. Путина, 1" },
      ready: true,
    });
    renderCard();

    expect(await screen.findByText(/Пункт не выбран/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Город"), { target: { value: "Грозный" } });
    fireEvent.click(screen.getByRole("button", { name: "Найти пункты" }));
    fireEvent.change(await screen.findByLabelText("Пункт приёма"), {
      target: { value: "st-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить пункт" }));

    await screen.findByText(/Сейчас: Грозный, пр. Путина, 1/);
    expect(dropoffPointsMock.mock.calls[0][0]).toBe("Грозный");
    expect(saveDropoffMock.mock.calls[0][0]).toBe("st-1");
  });
});

describe("«Экспресс» в карточке подключения", () => {
  it("показывает адрес точки продажи и включает «Экспресс» с телефоном", async () => {
    fetchMock.mockResolvedValue({
      connected: true,
      enabled: true,
      tokenMasked: "…abcd",
      environment: "prod",
      express: {
        enabled: false,
        phone: "",
        pickupAddress: "Грозный, ул. Лорсанова, 5",
        ready: false,
      },
    });
    expressMock.mockResolvedValue({
      enabled: true,
      phone: "+79990001122",
      pickupAddress: "Грозный, ул. Лорсанова, 5",
      ready: true,
    });
    renderCard();

    expect(await screen.findByText("Грозный, ул. Лорсанова, 5")).toBeTruthy();
    fireEvent.change(
      screen.getByLabelText("Телефон, по которому курьер вам позвонит"),
      {
        target: { value: " +79990001122 " },
      },
    );
    fireEvent.click(screen.getByRole("switch", { name: /Экспресс/ }));

    await waitFor(() =>
      expect(expressMock).toHaveBeenCalledWith(
        { enabled: true, phone: "+79990001122" },
        expect.anything(),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: /Экспресс/ }).checked).toBe(true),
    );
  });
});
