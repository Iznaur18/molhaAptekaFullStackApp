import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HEADER_NOTIFICATIONS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { MyProfilePage } from "./MyProfilePage.jsx";

const user = {
  _id: "6a871e02e4b218aa47757078",
  userName: "user.name",
  email: "user@example.com",
};

/** @param {number} unreadNotificationsCount */
function renderProfile(unreadNotificationsCount) {
  return renderWithProviders(
    <MemoryRouter>
      <MyProfilePage user={user} unreadNotificationsCount={unreadNotificationsCount} />
    </MemoryRouter>,
  );
}

describe("MyProfilePage: счётчик уведомлений на колокольчике", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    );
  });

  it("показывает число непрочитанных", () => {
    renderProfile(7);

    const bell = screen.getByRole("button", {
      name: HEADER_NOTIFICATIONS_BUTTON_UI.ARIA,
    });
    expect(bell).toHaveTextContent("7");
  });

  it("схлопывает больше 99 в 99+", () => {
    renderProfile(140);

    expect(
      screen.getByRole("button", { name: HEADER_NOTIFICATIONS_BUTTON_UI.ARIA }),
    ).toHaveTextContent("99+");
  });

  it("без уведомлений бейджа нет", () => {
    renderProfile(0);

    expect(
      screen.getByRole("button", { name: HEADER_NOTIFICATIONS_BUTTON_UI.ARIA }),
    ).toHaveTextContent("");
  });
});
