import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CURATED_LIST_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { renderWithProviders } from "../../../test/renderWithProviders.jsx";
import { CuratedListCarouselHeader } from "./CuratedListCarouselHeader.jsx";

describe("CuratedListCarouselHeader", () => {
  it("рендерит заголовок и кнопку «Все»", () => {
    renderWithProviders(<CuratedListCarouselHeader title="ТОП ТОП ТОП" />);

    expect(screen.getByRole("heading", { name: "ТОП ТОП ТОП" })).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: CURATED_LIST_CAROUSEL_UI.VIEW_ALL_ARIA("ТОП ТОП ТОП"),
      }),
    ).toBeTruthy();
    expect(screen.getByText(CURATED_LIST_CAROUSEL_UI.VIEW_ALL)).toBeTruthy();
  });
});
