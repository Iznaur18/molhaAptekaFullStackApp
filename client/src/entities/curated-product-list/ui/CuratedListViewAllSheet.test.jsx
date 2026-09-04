import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CURATED_LIST_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { CuratedListViewAllSheet } from "./CuratedListViewAllSheet.jsx";

const PRODUCTS = [
  {
    _id: "p1",
    productName: "Товар один",
    productPrice: 100,
    productImageUrls: [],
  },
  {
    _id: "p2",
    productName: "Товар два",
    productPrice: 200,
    productImageUrls: [],
  },
];

describe("CuratedListViewAllSheet", () => {
  it("открывается с заголовком и закрывается по dismiss", async () => {
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(
      <CuratedListViewAllSheet isOpen title="ТОП ТОП ТОП" onClose={onClose} />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "ТОП ТОП ТОП" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /понятно/i })).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: CURATED_LIST_CAROUSEL_UI.SHEET_CLOSE_ARIA }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <CuratedListViewAllSheet isOpen={false} title="ТОП ТОП ТОП" onClose={onClose} />,
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("показывает товары сеткой и не закрывает sheet при открытии товара", () => {
    const onClose = vi.fn();
    const onOpenProduct = vi.fn();
    renderWithProviders(
      <CuratedListViewAllSheet
        isOpen
        title="Подборка"
        products={PRODUCTS}
        onOpenProduct={onOpenProduct}
        onClose={onClose}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: /открыть товар товар один/i })[0],
    );
    expect(onOpenProduct).toHaveBeenCalledWith(PRODUCTS[0]);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /открыть товар товар два/i }).length,
    ).toBeGreaterThan(0);
  });

  it("показывает категории сеткой и не закрывает sheet при открытии", () => {
    const onClose = vi.fn();
    const onOpenCategory = vi.fn();
    const categories = [
      { itemKey: "c1", label: "Категория А", imageUrl: "" },
      { itemKey: "c2", label: "Категория Б", imageUrl: "" },
    ];
    renderWithProviders(
      <CuratedListViewAllSheet
        isOpen
        title="ТОП"
        categories={categories}
        onOpenCategory={onOpenCategory}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Категория А" }));
    expect(onOpenCategory).toHaveBeenCalledWith(categories[0]);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Категория Б" })).toBeTruthy();
  });
});
