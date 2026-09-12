import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";

import { MyProductsCatalogToolbar } from "./MyProductsCatalogToolbar.jsx";

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

describe("тулбар «Мои товары»", () => {
  it("показывает квоту товаров", () => {
    renderToolbar();

    expect(
      screen.getByLabelText(`${HOME_PAGE_UI.MY_PRODUCTS_QUOTA_LABEL}: 12 / 50`),
    ).toBeTruthy();
  });

  it("админу квоту не показывает", () => {
    renderToolbar({ isAdmin: true });

    expect(screen.queryByLabelText(/лимит/i)).toBeNull();
  });
});
