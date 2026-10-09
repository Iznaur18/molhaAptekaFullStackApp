import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

import { MyProductsCatalogToolbar } from "./MyProductsCatalogToolbar.jsx";

// Пауза магазина ходит в сеть — у неё свой тест.
vi.mock("../../../entities/seller-store-pause/ui/SellerStorePauseControl.jsx", () => ({
  SellerStorePauseControl: () => null,
}));
vi.mock(
  "../../../entities/seller-store-pause/model/sellerStorePauseQueries.js",
  () => ({
    useMySellerStorePauseQuery: () => ({ data: undefined }),
  }),
);

const renderToolbar = (props = {}) =>
  renderWithProviders(
    <MyProductsCatalogToolbar
      catalogSort="new"
      onCatalogSortChange={vi.fn()}
      isAdmin={false}
      myProductsTotal={12}
      sellerProductsLimit={50}
      {...props}
    />,
  );

const openMoreMenu = () =>
  fireEvent.click(
    screen.getByRole("button", { name: HOME_PAGE_UI.MY_PRODUCTS_MORE_MENU_ARIA }),
  );

describe("тулбар «Мои товары»", () => {
  it("показывает квоту товаров в меню «⋯»", () => {
    renderToolbar();

    openMoreMenu();

    expect(
      screen.getByLabelText(`${HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}: 12 / 50`),
    ).toBeTruthy();
  });

  it("админу без квоты и паузы меню не показывает", () => {
    renderToolbar({ isAdmin: true });

    expect(
      screen.queryByRole("button", { name: HOME_PAGE_UI.MY_PRODUCTS_MORE_MENU_ARIA }),
    ).toBeNull();
  });

  it("чип статуса переключает фильтр и отмечен как выбранный", () => {
    const onFilterChange = vi.fn();
    renderToolbar({
      myProductsModerationFilter: "pending",
      onMyProductsModerationFilterChange: onFilterChange,
    });

    expect(
      screen.getByRole("button", { name: "На проверке" }).getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Одобрены" }));

    expect(onFilterChange.mock.calls[0][0]).toBe("approved");
  });

  it("сортировка меняется через системный список", () => {
    const onSortChange = vi.fn();
    renderToolbar({ onCatalogSortChange: onSortChange });

    const select = screen.getByLabelText(HOME_PAGE_UI.SORT_LABEL);
    const nextValue = select.querySelectorAll("option")[1].value;
    fireEvent.change(select, { target: { value: nextValue } });

    expect(onSortChange.mock.calls[0][0]).toBe(nextValue);
  });
});
