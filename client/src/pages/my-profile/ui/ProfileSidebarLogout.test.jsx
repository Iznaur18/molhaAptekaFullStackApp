import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ProfileSidebar } from "./ProfileSidebar.jsx";
import { ProfileSidebarLogout } from "./ProfileSidebarLogout.jsx";

describe("ProfileSidebarLogout", () => {
  it("renders logout trigger", () => {
    render(<ProfileSidebarLogout onLogout={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: MY_PROFILE_PAGE_UI.LOGOUT }),
    ).toBeInTheDocument();
  });

  it("confirms logout and calls onLogout", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(<ProfileSidebarLogout onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: MY_PROFILE_PAGE_UI.LOGOUT }));
    await user.click(screen.getByRole("button", { name: MY_PROFILE_PAGE_UI.LOGOUT_YES }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe("ProfileSidebar", () => {
  it("renders logout as the last nav group", () => {
    render(
      <ProfileSidebar
        groups={[
          {
            id: "overview",
            items: [
              {
                tab: "overview",
                label: MY_PROFILE_PAGE_UI.TAB_OVERVIEW,
                onClick: vi.fn(),
              },
            ],
          },
        ]}
        activeTab="overview"
        onLogout={vi.fn()}
      />,
    );

    const navGroups = document.querySelectorAll(".my-profile-page__nav-group");
    expect(navGroups[navGroups.length - 1]).toHaveClass("my-profile-page__nav-group_logout");
    expect(
      screen.getByRole("button", { name: MY_PROFILE_PAGE_UI.LOGOUT }),
    ).toBeInTheDocument();
  });
});
