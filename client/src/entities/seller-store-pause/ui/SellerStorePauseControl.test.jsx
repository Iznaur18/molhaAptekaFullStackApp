import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SELLER_STORE_PAUSE_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

import { SellerStorePauseControl } from "./SellerStorePauseControl.jsx";

const api = vi.hoisted(() => ({
  fetchMySellerStorePause: vi.fn(),
  setMySellerStorePause: vi.fn(),
}));

vi.mock("../api/sellerStorePauseApi.js", () => api);

/** @param {Partial<import("../model/types.js").SellerStorePause>} [overrides] */
const storePause = (overrides = {}) => ({
  paused: false,
  pausedAt: null,
  visibleProductCount: 3,
  pausedProductCount: 0,
  ...overrides,
});

/** Пункт меню и плашка живут в разных местах тулбара — рендерим оба. */
const renderControl = () =>
  renderWithProviders(
    <>
      <SellerStorePauseControl mode="action" />
      <SellerStorePauseControl mode="banner" />
    </>,
  );

afterEach(() => {
  vi.restoreAllMocks();
  api.fetchMySellerStorePause.mockReset();
  api.setMySellerStorePause.mockReset();
});

describe("пауза магазина в «Моих товарах»", () => {
  it("после подтверждения скрывает все товары и показывает плашку", async () => {
    api.fetchMySellerStorePause.mockResolvedValue(storePause());
    api.setMySellerStorePause.mockResolvedValue(
      storePause({ paused: true, visibleProductCount: 0, pausedProductCount: 3 }),
    );
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderControl();
    fireEvent.click(
      await screen.findByRole("button", { name: SELLER_STORE_PAUSE_UI.PAUSE_BUTTON }),
    );

    expect(confirm).toHaveBeenCalledWith(SELLER_STORE_PAUSE_UI.PAUSE_CONFIRM(3));
    await waitFor(() => expect(api.setMySellerStorePause.mock.calls[0][0]).toBe(true));
    expect(await screen.findByText(SELLER_STORE_PAUSE_UI.PAUSED_TITLE)).toBeTruthy();
    expect(screen.getByText(SELLER_STORE_PAUSE_UI.PAUSED_TEXT(3))).toBeTruthy();
  });

  it("без подтверждения ничего не меняет", async () => {
    api.fetchMySellerStorePause.mockResolvedValue(storePause());
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderControl();
    fireEvent.click(
      await screen.findByRole("button", { name: SELLER_STORE_PAUSE_UI.PAUSE_BUTTON }),
    );

    expect(api.setMySellerStorePause).not.toHaveBeenCalled();
  });

  it("на паузе предлагает вернуть товары", async () => {
    api.fetchMySellerStorePause.mockResolvedValue(
      storePause({ paused: true, visibleProductCount: 0, pausedProductCount: 2 }),
    );
    api.setMySellerStorePause.mockResolvedValue(storePause({ visibleProductCount: 2 }));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderControl();
    fireEvent.click(
      await screen.findByRole("button", { name: SELLER_STORE_PAUSE_UI.RESUME_BUTTON }),
    );

    await waitFor(() => expect(api.setMySellerStorePause.mock.calls[0][0]).toBe(false));
    expect(
      await screen.findByRole("button", { name: SELLER_STORE_PAUSE_UI.PAUSE_BUTTON }),
    ).toBeTruthy();
  });

  it("не показывает кнопку, когда скрывать нечего", async () => {
    api.fetchMySellerStorePause.mockResolvedValue(
      storePause({ visibleProductCount: 0 }),
    );

    const { container } = renderControl();

    await waitFor(() => expect(api.fetchMySellerStorePause).toHaveBeenCalled());
    expect(container.querySelector(".seller-store-pause")).toBeNull();
  });

  it("показывает ошибку сервера", async () => {
    api.fetchMySellerStorePause.mockResolvedValue(storePause());
    api.setMySellerStorePause.mockRejectedValue(new Error("Сервер недоступен"));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderControl();
    fireEvent.click(
      await screen.findByRole("button", { name: SELLER_STORE_PAUSE_UI.PAUSE_BUTTON }),
    );

    expect((await screen.findByRole("alert")).textContent).toBe("Сервер недоступен");
  });
});
