import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
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
  it("доверенному продавцу объясняет, что проверки нет", () => {
    renderToolbar({ isModerationTrusted: true });

    expect(
      screen.getByText(PRODUCT_MODERATION_PAGE_UI.SELLER_TRUSTED_NOTICE),
    ).toBeTruthy();
  });

  it("обычному продавцу пометку не показывает", () => {
    renderToolbar();

    expect(
      screen.queryByText(PRODUCT_MODERATION_PAGE_UI.SELLER_TRUSTED_NOTICE),
    ).toBeNull();
  });
});
