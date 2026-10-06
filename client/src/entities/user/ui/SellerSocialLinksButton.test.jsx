import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SELLER_SOCIAL_LINKS_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { SellerSocialLinksButton } from "./SellerSocialLinksButton.jsx";

const INSTAGRAM_LINK = {
  id: "socialInstagramUrl",
  label: "Instagram",
  href: "https://instagram.com/shop",
  display: "instagram.com/shop",
};

const openSheet = async () => {
  fireEvent.click(
    screen.getByRole("button", { name: SELLER_SOCIAL_LINKS_UI.BUTTON_ARIA }),
  );
  return screen.findByRole("dialog", { name: SELLER_SOCIAL_LINKS_UI.TITLE });
};

describe("окно «Соцсети и сайт» на витрине", () => {
  it("гость видит только добавленные ссылки", async () => {
    renderWithProviders(<SellerSocialLinksButton links={[INSTAGRAM_LINK]} />);

    const dialog = await openSheet();

    expect(dialog).toHaveTextContent("instagram.com/shop");
    expect(screen.queryByText(SELLER_SOCIAL_LINKS_UI.ADD_TITLE)).toBeNull();
  });

  it("у чужой витрины без ссылок кнопки нет", () => {
    renderWithProviders(<SellerSocialLinksButton links={[]} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("владелец видит недобавленное, нажатие ведёт в редактирование профиля", async () => {
    const onAddLink = vi.fn();
    renderWithProviders(
      <SellerSocialLinksButton links={[INSTAGRAM_LINK]} isSelf onAddLink={onAddLink} />,
    );

    await openSheet();

    expect(screen.getByText(SELLER_SOCIAL_LINKS_UI.ADD_TITLE)).toBeTruthy();
    // Instagram уже добавлен — среди недостающих его нет, остальные пять есть.
    expect(
      screen.queryByRole("button", {
        name: SELLER_SOCIAL_LINKS_UI.ADD_ARIA("Instagram"),
      }),
    ).toBeNull();
    for (const label of ["WhatsApp", "Telegram", "YouTube", "VK", "Сайт"]) {
      expect(
        screen.getByRole("button", { name: SELLER_SOCIAL_LINKS_UI.ADD_ARIA(label) }),
      ).toBeTruthy();
    }

    fireEvent.click(
      screen.getByRole("button", { name: SELLER_SOCIAL_LINKS_UI.ADD_ARIA("YouTube") }),
    );

    expect(onAddLink).toHaveBeenCalledWith("socialYoutubeUrl");
  });
});
