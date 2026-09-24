import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { useAccountSwitcher } from "../../../features/account-switcher/model/useAccountSwitcher.js";
import { ProfileSidebarAccounts } from "./ProfileSidebarAccounts.jsx";

const fetchLinkedAccounts = vi.fn();
const removeLinkedAccount = vi.fn(async () => ({ removedActive: false }));

vi.mock("../../../entities/user/api/linkedAccountsApi.js", () => ({
  fetchLinkedAccounts: () => fetchLinkedAccounts(),
  logoutAllLinkedAccounts: vi.fn(),
  removeLinkedAccount: (userId) => removeLinkedAccount(userId),
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

function Harness() {
  const switcher = useAccountSwitcher();
  return <ProfileSidebarAccounts switcher={switcher} />;
}

describe("ProfileSidebarAccounts", () => {
  it("текущий отмечен и не бледный, остальные переключаемы, есть «Добавить»", async () => {
    fetchLinkedAccounts.mockResolvedValue({
      accounts: [
        account({ userName: "alice", isActive: true }),
        account({ userId: "b".repeat(24), userName: "bob" }),
        account({ userId: "c".repeat(24), userName: "carol", requiresLogin: true }),
      ],
      maxAccounts: 5,
    });
    renderWithProviders(<Harness />);

    const active = await screen.findByRole("button", {
      name: `${ACCOUNT_SWITCHER_UI.ACTIVE_ARIA}: alice`,
    });
    expect(active).toHaveAttribute("aria-current", "true");
    expect(active).toHaveClass("my-profile-page__nav-button_active");
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.SWITCH_ARIA("bob") }),
    ).toBeEnabled();
    expect(screen.getByText(ACCOUNT_SWITCHER_UI.REQUIRES_LOGIN)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.ADD }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ACCOUNT_SWITCHER_UI.REMOVE_ARIA("alice") }),
    ).toBeNull();
  });

  it("«Убрать» спрашивает подтверждение на месте и только потом убирает", async () => {
    const user = userEvent.setup();
    fetchLinkedAccounts.mockResolvedValue({
      accounts: [
        account({ userName: "alice", isActive: true }),
        account({ userId: "b".repeat(24), userName: "bob" }),
      ],
      maxAccounts: 5,
    });
    renderWithProviders(<Harness />);

    await user.click(
      await screen.findByRole("button", {
        name: ACCOUNT_SWITCHER_UI.REMOVE_ARIA("bob"),
      }),
    );
    expect(
      screen.getByText(ACCOUNT_SWITCHER_UI.REMOVE_CONFIRM("bob")),
    ).toBeInTheDocument();
    expect(removeLinkedAccount).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: ACCOUNT_SWITCHER_UI.REMOVE_YES }),
    );
    expect(removeLinkedAccount).toHaveBeenCalledWith("b".repeat(24));
  });

  it("на лимите вместо «Добавить» — подсказка", async () => {
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
    renderWithProviders(<Harness />);

    expect(
      await screen.findByText(ACCOUNT_SWITCHER_UI.LIMIT_REACHED(5)),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ACCOUNT_SWITCHER_UI.ADD })).toBeNull();
  });
});
