import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";

const fetchUsersSearchPageMock = vi.fn();

vi.mock("../../../entities/user/api/fetchUsersSearch.js", () => ({
  fetchUsersSearchPage: (...args) => fetchUsersSearchPageMock(...args),
}));

const { UsersPage } = await import("./UsersPage.jsx");

function renderUsersPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Поисковые вызовы без учёта стартовой загрузки общего списка. */
function searchCallsFor(term) {
  return fetchUsersSearchPageMock.mock.calls.filter(([params]) => params?.search === term);
}

describe("UsersPage: поиск только по «Найти»", () => {
  beforeEach(() => {
    fetchUsersSearchPageMock.mockReset();
    fetchUsersSearchPageMock.mockResolvedValue({ users: [] });
  });

  it("не ищет, пока пользователь печатает", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    await user.type(screen.getByRole("searchbox"), "izna");

    // Ждём заведомо дольше, чем жил прежний дебаунс (350 мс).
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(searchCallsFor("izna")).toHaveLength(0);
  });

  it("ищет по нажатию Enter", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    await user.type(screen.getByRole("searchbox"), "izna{Enter}");

    await waitFor(() => {
      expect(searchCallsFor("izna")).toHaveLength(1);
    });
  });

  it("сбрасывает поиск при очистке поля — без «Найти»", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    const input = screen.getByRole("searchbox");
    await user.type(input, "izna{Enter}");
    await waitFor(() => {
      expect(searchCallsFor("izna")).toHaveLength(1);
    });

    await user.clear(input);

    await waitFor(() => {
      expect(searchCallsFor("")).not.toHaveLength(0);
    });
  });
});
