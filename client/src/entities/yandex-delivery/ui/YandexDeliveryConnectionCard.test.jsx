import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchMock = vi.fn();
const saveMock = vi.fn();
const removeMock = vi.fn();
const toggleMock = vi.fn();

vi.mock("../api/yandexDeliveryCredentialsApi.js", () => ({
  fetchYandexDeliveryConnection: (...args) => fetchMock(...args),
  saveYandexDeliveryConnection: (...args) => saveMock(...args),
  removeYandexDeliveryConnection: (...args) => removeMock(...args),
  toggleYandexDeliveryConnection: (...args) => toggleMock(...args),
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
    expect(screen.getByRole("switch").checked).toBe(true);
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

    fireEvent.click(await screen.findByRole("switch"));

    await screen.findByText("Яндекс Доставка скрыта от покупателей");
    expect(toggleMock.mock.calls[0][0]).toBe(false);
  });
});
