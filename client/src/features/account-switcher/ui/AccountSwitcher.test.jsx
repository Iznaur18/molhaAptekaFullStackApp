import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { AccountSwitcher } from "./AccountSwitcher.jsx";

const fetchLinkedAccounts = vi.fn();

vi.mock("../../../entities/user/api/linkedAccountsApi.js", () => ({
  fetchLinkedAccounts: () => fetchLinkedAccounts(),
  logoutAllLinkedAccounts: vi.fn(),
  removeLinkedAccount: vi.fn(),
}));

/** @param {Partial<Record<string, unknown>>} overrides */
const account = (overrides) => ({
  userId: "a".repeat(24),
  userName: "alice",
  userAvatarUrl: null,
  isPremiumUser: false,
  isUserDataConfirmed: false,
  isActive: false,
  requiresLogin: false,
  ...overrides,
});

describe("AccountSwitcher", () => {
  it("профиль: активный отмечен, остальные переключаемы, есть «Добавить»", async () => {
    fetchLinkedAccounts.mockResolvedValue({
      accounts: [
        account({ userName: "alice", isActive: true }),
        account({ userId: "b".repeat(24), userName: "bob" }),
        account({ userId: "c".repeat(24), userName: "carol", requiresLogin: true }),
      ],
      maxAccounts: 5,
    });
    renderWithProviders(<AccountSwitcher />);

    const active = await screen.findByRole("button", {
      name: `${ACCOUNT_SWITCHER_UI.ACTIVE_ARIA}: alice`,
    });
    expect(active).toBeDisabled();
    expect(active).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.SWITCH_ARIA("bob") }),
    ).toBeEnabled();
    expect(screen.getByText(ACCOUNT_SWITCHER_UI.REQUIRES_LOGIN)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.ADD }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.LOGOUT_ALL }),
    ).toBeInTheDocument();
  });

  it("профиль: на лимите вместо «Добавить» — подсказка", async () => {
    fetchLinkedAccounts.mockResolvedValue({
      accounts: Array.from({ length: 5 }, (_, index) =>
        account({
          userId: String(index).repeat(24),
          userName: `user${index}`,
          isActive: index === 0,
        }),
      ),
      maxAccounts: 5,
    });
    renderWithProviders(<AccountSwitcher />);

    expect(
      await screen.findByText(ACCOUNT_SWITCHER_UI.LIMIT_REACHED(5)),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ACCOUNT_SWITCHER_UI.ADD })).toBeNull();
  });

  it("вход: без сохранённых аккаунтов ничего не рисует", async () => {
    fetchLinkedAccounts.mockResolvedValue({ accounts: [], maxAccounts: 5 });
    const { container } = renderWithProviders(<AccountSwitcher variant="login" />);
    await Promise.resolve();
    expect(container.querySelector(".account-switcher")).toBeNull();
  });

  it("вход: аккаунт, требующий пароля, нельзя выбрать", async () => {
    fetchLinkedAccounts.mockResolvedValue({
      accounts: [account({ userName: "bob", requiresLogin: true })],
      maxAccounts: 5,
    });
    renderWithProviders(<AccountSwitcher variant="login" />);

    expect(
      await screen.findByRole("button", {
        name: ACCOUNT_SWITCHER_UI.SWITCH_ARIA("bob"),
      }),
    ).toBeDisabled();
    expect(screen.queryByRole("button", { name: ACCOUNT_SWITCHER_UI.ADD })).toBeNull();
  });
});
