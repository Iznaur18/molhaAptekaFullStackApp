import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CATEGORY_TILE_IMAGES_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { fetchProductCategoryDisplays } from "../api/fetchProductCategoryDisplays.js";
import { patchProductCategoryDisplaySettings } from "../api/patchProductCategoryDisplaySettings.js";
import { CatalogCategoryTilesGrid } from "./CatalogCategoryTilesGrid.jsx";
import { CategoryTileImagesToggle } from "./CategoryTileImagesToggle.jsx";

vi.mock("../api/fetchProductCategoryDisplays.js", () => ({
  fetchProductCategoryDisplays: vi.fn(),
}));
vi.mock("../api/patchProductCategoryDisplaySettings.js", () => ({
  patchProductCategoryDisplaySettings: vi.fn(),
}));

const ITEMS = [
  {
    key: "a",
    label: "Тестовая категория",
    categoryId: "a",
    imageUrl: "/uploads/test-category.webp",
  },
];

/** @param {boolean} tileImagesEnabled */
const mockDisplays = (tileImagesEnabled) =>
  vi.mocked(fetchProductCategoryDisplays).mockResolvedValue({
    displays: [],
    tileImagesEnabled,
  });

const tile = () => screen.getByRole("button", { name: "Тестовая категория" });

describe("картинки на плитках категорий", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("включены — плитка с картинкой", async () => {
    mockDisplays(true);
    const { container } = renderWithProviders(
      <CatalogCategoryTilesGrid items={ITEMS} onTileClick={() => {}} />,
    );

    await waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(tile().className).not.toContain("catalog-categories-grid__card_text");
  });

  it("включены, но своей картинки нет — заглушка фоном, а не картинкой", async () => {
    mockDisplays(true);
    const { container } = renderWithProviders(
      <CatalogCategoryTilesGrid
        items={[{ key: "b", label: "Без картинки", categoryId: "b" }]}
        onTileClick={() => {}}
      />,
    );

    await waitFor(() =>
      expect(
        container.querySelector(".catalog-categories-grid__image-wrap_placeholder"),
      ).not.toBeNull(),
    );
    // Светлая подложка была зашита в картинку и не шла за тёмной темой.
    expect(container.querySelector("img")).toBeNull();
  });

  it("выключены админом — плитка без картинки, только название", async () => {
    mockDisplays(false);
    const { container } = renderWithProviders(
      <CatalogCategoryTilesGrid items={ITEMS} onTileClick={() => {}} />,
    );

    await waitFor(() =>
      expect(tile().className).toContain("catalog-categories-grid__card_text"),
    );
    expect(container.querySelector("img")).toBeNull();
    expect(tile()).toHaveTextContent("Тестовая категория");
  });

  it("админ выключает картинки — плитки сразу без картинок", async () => {
    mockDisplays(true);
    vi.mocked(patchProductCategoryDisplaySettings).mockResolvedValue({
      tileImagesEnabled: false,
    });
    const { container } = renderWithProviders(
      <>
        <CategoryTileImagesToggle />
        <CatalogCategoryTilesGrid items={ITEMS} onTileClick={() => {}} />
      </>,
    );

    const toggle = await screen.findByRole("switch", {
      name: CATEGORY_TILE_IMAGES_UI.LABEL,
      checked: true,
    });
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(patchProductCategoryDisplaySettings).toHaveBeenCalledTimes(1),
    );
    expect(vi.mocked(patchProductCategoryDisplaySettings).mock.calls[0][0]).toEqual({
      tileImagesEnabled: false,
    });
    await waitFor(() => expect(container.querySelector("img")).toBeNull());
    expect(
      screen.getByRole("switch", {
        name: CATEGORY_TILE_IMAGES_UI.LABEL,
        checked: false,
      }),
    ).toBeTruthy();
  });
});
