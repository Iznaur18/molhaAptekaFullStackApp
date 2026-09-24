import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { SavedAccountsList } from "./SavedAccountsList.jsx";

const fetchLinkedAccounts = vi.fn();

vi.mock("../../../entities/user/api/linkedAccountsApi.js", () => ({
  fetchLinkedAccounts: () => fetchLinkedAccounts(),
  logoutAllLinkedAccounts: vi.fn(),
  removeLinkedAccount: vi.fn(),
}));

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

describe("SavedAccountsList", () => {
  it("без сохранённых аккаунтов ничего не рисует", async () => {
    fetchLinkedAccounts.mockResolvedValue({ accounts: [], maxAccounts: 5 });
    const { container } = renderWithProviders(<SavedAccountsList />);
    await Promise.resolve();
    expect(container.querySelector(".saved-accounts")).toBeNull();
  });

  it("аккаунт с паролем выбрать нельзя, остальные — можно", async () => {
    fetchLinkedAccounts.mockResolvedValue({
      accounts: [
        account({ userName: "alice" }),
        account({ userId: "b".repeat(24), userName: "bob", requiresLogin: true }),
      ],
      maxAccounts: 5,
    });
    renderWithProviders(<SavedAccountsList />);

    expect(
      await screen.findByRole("button", {
        name: ACCOUNT_SWITCHER_UI.SWITCH_ARIA("alice"),
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.SWITCH_ARIA("bob") }),
    ).toBeDisabled();
  });
});
