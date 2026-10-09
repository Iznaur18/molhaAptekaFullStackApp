import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { CuratedCategoryCompactCard } from "./CuratedCategoryCompactCard.jsx";

describe("CuratedCategoryCompactCard", () => {
  it("в sheet для tree показывает только название", () => {
    renderWithProviders(
      <CuratedCategoryCompactCard
        showDetails
        category={{
          kind: "tree",
          refId: "t1",
          itemKey: "tree:t1",
          label: "Электроника",
          imageUrl: null,
        }}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText("Электроника")).toBeTruthy();
  });

  it("в sheet для personal показывает имя, рейтинг и график", () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <CuratedCategoryCompactCard
        showDetails
        category={{
          kind: "personal",
          refId: "p1",
          itemKey: "personal:p1",
          label: "Моя полка",
          imageUrl: null,
          sellerId: "s1",
          sellerFullName: "Иван Петров",
          sellerRatingAverage: 4.7,
          sellerRatingVotes: 12,
          sellerBusinessHoursLabel: "ПН-СБ, 10:00–18:00",
        }}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText("Иван Петров")).toBeTruthy();
    expect(screen.getByText("4.7")).toBeTruthy();
    expect(screen.getByText("ПН-СБ, 10:00–18:00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Моя полка" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("personal без картинки показывает название вместо общей заглушки", () => {
    const { container } = renderWithProviders(
      <CuratedCategoryCompactCard
        category={{
          kind: "personal",
          refId: "p1",
          itemKey: "personal:p1",
          label: "Мой магазин",
          imageUrl: null,
          sellerId: "s1",
        }}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText("Мой магазин")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });

  it("tree без картинки остаётся с картинкой-заглушкой", () => {
    const { container } = renderWithProviders(
      <CuratedCategoryCompactCard
        category={{
          kind: "tree",
          refId: "t1",
          itemKey: "tree:t1",
          label: "Электроника",
          imageUrl: null,
        }}
        onOpen={vi.fn()}
      />,
    );

    expect(container.querySelector("img")).not.toBeNull();
    expect(screen.queryByText("Электроника")).toBeNull();
  });

  it("без showDetails мета не рендерится", () => {
    renderWithProviders(
      <CuratedCategoryCompactCard
        category={{
          kind: "personal",
          refId: "p1",
          itemKey: "personal:p1",
          label: "Моя полка",
          imageUrl: null,
          sellerFullName: "Иван Петров",
          sellerRatingAverage: 4.7,
          sellerBusinessHoursLabel: "Пн, 10:00–18:00",
        }}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.queryByText("Иван Петров")).toBeNull();
  });
});
