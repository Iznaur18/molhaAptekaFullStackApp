import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchCdekConnectionMock = vi.fn();
const saveCdekConnectionMock = vi.fn();
const removeCdekConnectionMock = vi.fn();

vi.mock("../api/cdekCredentialsApi.js", () => ({
  fetchCdekConnection: (...args) => fetchCdekConnectionMock(...args),
  saveCdekConnection: (...args) => saveCdekConnectionMock(...args),
  removeCdekConnection: (...args) => removeCdekConnectionMock(...args),
}));

const { CdekConnectionCard } = await import("./CdekConnectionCard.jsx");

const NOT_CONNECTED = {
  connected: false,
  environment: "prod",
  accountMasked: "",
  validatedAt: null,
  lastError: "",
};

function renderCard() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <CdekConnectionCard />
    </QueryClientProvider>,
  );
}

describe("карточка подключения СДЭК", () => {
  beforeEach(() => {
    fetchCdekConnectionMock.mockReset();
    saveCdekConnectionMock.mockReset();
    removeCdekConnectionMock.mockReset();
  });

  it("без ключей показывает «не подключён» и не даёт отправить пустую форму", async () => {
    fetchCdekConnectionMock.mockResolvedValue(NOT_CONNECTED);
    renderCard();

    expect(await screen.findByText("СДЭК не подключён")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Подключить СДЭК" }).disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Отключить" })).toBeNull();
  });

  it("сохраняет ключи и очищает поля: секрет в форме не задерживается", async () => {
    fetchCdekConnectionMock.mockResolvedValue(NOT_CONNECTED);
    saveCdekConnectionMock.mockResolvedValue({
      connected: true,
      environment: "test",
      accountMasked: "••••JceI",
      validatedAt: "2026-09-20T10:00:00.000Z",
      lastError: "",
    });
    const { container } = renderCard();
    await screen.findByText("СДЭК не подключён");

    const [accountInput] = container.querySelectorAll("input[type=text]");
    const [secureInput] = container.querySelectorAll("input[type=password]");
    fireEvent.change(accountInput, { target: { value: "EMscd6r9JnFiQceI" } });
    fireEvent.change(secureInput, { target: { value: "super-secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Подключить СДЭК" }));

    // react-query v5 вторым аргументом передаёт свой контекст — сверяем данные.
    await waitFor(() => {
      expect(saveCdekConnectionMock.mock.calls[0]?.[0]).toEqual({
        account: "EMscd6r9JnFiQceI",
        secure: "super-secret",
        environment: "test",
      });
    });
    expect(await screen.findByText("СДЭК подключён")).toBeTruthy();
    expect(screen.getByText("••••JceI")).toBeTruthy();
    expect(secureInput.value).toBe("");
    expect(accountInput.value).toBe("");
  });

  it("ошибку от СДЭК показывает как есть, а не «что-то пошло не так»", async () => {
    fetchCdekConnectionMock.mockResolvedValue(NOT_CONNECTED);
    saveCdekConnectionMock.mockRejectedValue(
      new Error("СДЭК не принял ключи: проверьте Account и Secure password"),
    );
    const { container } = renderCard();
    await screen.findByText("СДЭК не подключён");

    fireEvent.change(container.querySelector("input[type=text]"), {
      target: { value: "bad" },
    });
    fireEvent.change(container.querySelector("input[type=password]"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Подключить СДЭК" }));

    expect(
      await screen.findByText(
        "СДЭК не принял ключи: проверьте Account и Secure password",
      ),
    ).toBeTruthy();
  });
});
