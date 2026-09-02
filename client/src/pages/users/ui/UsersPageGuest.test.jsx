import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { USERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchUsersSearchPageMock = vi.fn();
vi.mock("../../../entities/user/api/fetchUsersSearch.js", () => ({
  fetchUsersSearchPage: (...args) => fetchUsersSearchPageMock(...args),
}));

const { UsersPage } = await import("./UsersPage.jsx");

/** @param {boolean} isAuthorized */
const renderPage = (isAuthorized) =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>
        <UsersPage isAuthorized={isAuthorized} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("список пользователей у гостя", () => {
  it("зовёт войти, а не висит на «Загрузка»", () => {
    fetchUsersSearchPageMock.mockReset();
    renderPage(false);

    // На проде страница вставала на «Загрузка пользователей…» навсегда.
    expect(screen.queryByText(USERS_PAGE_UI.LOADING)).toBeNull();
    expect(screen.getByText(USERS_PAGE_UI.LOGIN_HINT)).toBeTruthy();
  });

  it("не шлёт заведомо отказной запрос", () => {
    fetchUsersSearchPageMock.mockReset();
    fetchUsersSearchPageMock.mockResolvedValue({ users: [] });
    renderPage(false);

    expect(fetchUsersSearchPageMock).not.toHaveBeenCalled();
  });

  it("своим список по-прежнему запрашивает", () => {
    fetchUsersSearchPageMock.mockReset();
    fetchUsersSearchPageMock.mockResolvedValue({ users: [] });
    renderPage(true);

    expect(fetchUsersSearchPageMock).toHaveBeenCalled();
  });
});
